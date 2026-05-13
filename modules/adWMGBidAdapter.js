'use strict';

import { registerBidder } from '../src/adapters/bidderFactory.js';
import { config } from '../src/config.js';
import { BANNER, VIDEO } from '../src/mediaTypes.js';
import { deepAccess, isArray } from '../src/utils.js';
import { parseUserAgentDetailed } from '../libraries/userAgentUtils/detailed.js';
import { tryAppendQueryString } from '../libraries/urlUtils/urlUtils.js';

/**
 * @typedef {import('../src/adapters/bidderFactory.js').BidRequest} BidRequest
 * @typedef {import('../src/adapters/bidderFactory.js').Bid} Bid
 * @typedef {import('../src/adapters/bidderFactory.js').ServerResponse} ServerResponse
 */

const BIDDER_CODE = 'adWMG';
const ENDPOINT = 'https://hb.adwmg.com/hb';
let SYNC_ENDPOINT = 'https://hb.adwmg.com/cphb.html?';

export const spec = {
  code: BIDDER_CODE,
  aliases: ['wmg'],
  supportedMediaTypes: [BANNER, VIDEO],
  isBidRequestValid: (bid) => {
    if (!bid.params.publisherId) {
      return false;
    }

    const hasBanner = !!deepAccess(bid, 'mediaTypes.banner');
    const videoParams = deepAccess(bid, 'mediaTypes.video');
    const hasVideo = !!(videoParams &&
      isArray(videoParams.playerSize) && videoParams.playerSize.length > 0 &&
      isArray(videoParams.mimes) && videoParams.mimes.length > 0);

    return hasBanner || hasVideo;
  },
  buildRequests: (validBidRequests, bidderRequest) => {
    const timeout = bidderRequest.timeout || 0;
    const debug = config.getConfig('debug') || false;
    const referrer = bidderRequest.refererInfo.page;
    const locale = navigator?.language ? navigator.language.substr(0, 2) : '';
    const domain = bidderRequest.refererInfo.domain || '';
    const ua = navigator?.userAgent ? navigator.userAgent.toLowerCase() : '';
    const additional = spec.parseUserAgent(ua);

    return validBidRequests.map(bidRequest => {
      const checkFloorValue = (value) => {
        if (isNaN(parseFloat(value))) {
          return 0;
        } else return parseFloat(value);
      };

      // Resolve floor: prefer getFloor() module, fall back to params.floorCPM
      let floorCPM = 0;
      if (bidRequest.params.floorCPM) {
        floorCPM = checkFloorValue(bidRequest.params.floorCPM);
      }
      if (typeof bidRequest.getFloor === 'function') {
        const mediaType = deepAccess(bidRequest, 'mediaTypes.video') ? VIDEO : BANNER;
        const floorInfo = bidRequest.getFloor({
          currency: 'USD',
          mediaType,
          size: '*'
        });
        if (floorInfo && floorInfo.floor && !isNaN(floorInfo.floor)) {
          floorCPM = floorInfo.floor;
        }
      }

      const adUnit = {
        code: bidRequest.adUnitCode,
        bids: {
          bidder: bidRequest.bidder,
          params: {
            publisherId: bidRequest.params.publisherId,
            IABCategories: bidRequest.params.IABCategories || [],
            floorCPM
          }
        },
        mediaTypes: bidRequest.mediaTypes
      };

      if (bidRequest.hasOwnProperty('sizes') && bidRequest.sizes.length > 0) {
        adUnit.sizes = bidRequest.sizes;
      }

      // schain: prefer ortb2.source.ext.schain per Prebid.js conventions, fall back to legacy bidRequest.schain
      const supplyChain =
        deepAccess(bidRequest, 'ortb2.source.ext.schain') ||
        deepAccess(bidderRequest, 'ortb2.source.ext.schain') ||
        bidRequest.schain ||
        {};

      const request = {
        auctionId: bidRequest.auctionId,
        requestId: bidRequest.bidId,
        bidRequestsCount: bidRequest.bidRequestsCount,
        bidderRequestId: bidRequest.bidderRequestId,
        transactionId: bidRequest.ortb2Imp?.ext?.tid,
        referrer: referrer,
        timeout: timeout,
        adUnit: adUnit,
        locale: locale,
        domain: domain,
        os: additional.os,
        osv: additional.osv,
        devicetype: additional.devicetype,
        supplyChain: supplyChain
      };

      if (bidderRequest.gdprConsent) {
        request.gdpr = {
          applies: bidderRequest.gdprConsent.gdprApplies,
          consentString: bidderRequest.gdprConsent.consentString
        };
      }

      if (bidRequest.userId && bidRequest.userId.pubcid) {
        request.userId = {
          pubcid: bidRequest.userId.pubcid
        };
      }

      if (debug) {
        request.debug = debug;
      }

      return {
        method: 'POST',
        url: ENDPOINT,
        data: JSON.stringify(request),
        bidRequest
      };
    });
  },
  interpretResponse: (serverResponse, httpRequest) => {
    const bidResponses = [];

    if (serverResponse.body) {
      const response = serverResponse.body;
      const isVideo = !!(response.vastXml || response.vastUrl);
      const mediaType = isVideo ? VIDEO : BANNER;

      const bidResponse = {
        requestId: response.requestId,
        cpm: response.cpm,
        width: response.width,
        height: response.height,
        creativeId: response.creativeId,
        currency: response.currency,
        netRevenue: response.netRevenue,
        ttl: response.ttl,
        meta: {
          advertiserDomains: response.adomain && response.adomain.length ? response.adomain : [],
          mediaType
        }
      };

      if (isVideo) {
        bidResponse.mediaType = VIDEO;
        if (response.vastXml) {
          bidResponse.vastXml = response.vastXml;
        }
        if (response.vastUrl) {
          bidResponse.vastUrl = response.vastUrl;
        }
        // For instream video, width/height come from playerSize if not in response
        if (httpRequest && httpRequest.bidRequest) {
          const playerSize = deepAccess(httpRequest.bidRequest, 'mediaTypes.video.playerSize');
          if (playerSize && playerSize[0]) {
            bidResponse.width = response.width || playerSize[0][0];
            bidResponse.height = response.height || playerSize[0][1];
          }
        }
      } else {
        bidResponse.mediaType = BANNER;
        bidResponse.ad = response.ad;
      }

      bidResponses.push(bidResponse);
    }

    return bidResponses;
  },
  getUserSyncs: (syncOptions, serverResponses, gdprConsent) => {
    if (gdprConsent && SYNC_ENDPOINT.indexOf('gdpr') === -1) {
      SYNC_ENDPOINT = tryAppendQueryString(SYNC_ENDPOINT, 'gdpr', (gdprConsent.gdprApplies ? 1 : 0));
    }

    if (gdprConsent && typeof gdprConsent.consentString === 'string' && SYNC_ENDPOINT.indexOf('gdpr_consent') === -1) {
      SYNC_ENDPOINT = tryAppendQueryString(SYNC_ENDPOINT, 'gdpr_consent', gdprConsent.consentString);
    }

    if (SYNC_ENDPOINT.slice(-1) === '&') {
      SYNC_ENDPOINT = SYNC_ENDPOINT.slice(0, -1);
    }

    const syncs = [];
    if (syncOptions.iframeEnabled) {
      syncs.push({
        type: 'iframe',
        url: SYNC_ENDPOINT
      });
    }
    return syncs;
  },
  parseUserAgent: (ua) => {
    const info = parseUserAgentDetailed(ua);
    return {
      devicetype: info.devicetype,
      os: info.os,
      osv: info.osv
    };
  }
};
registerBidder(spec);
