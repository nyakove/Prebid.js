import { expect } from 'chai';
import { spec } from 'modules/adWMGBidAdapter.js';
import { config } from 'src/config.js';

describe('adWMGBidAdapter', function () {
  describe('isBidRequestValid', function () {
    let bannerBid, videoBid;
    beforeEach(function() {
      bannerBid = {
        bidder: 'adWMG',
        params: {
          publisherId: '5cebea3c9eea646c7b623d5e'
        },
        mediaTypes: {
          banner: {
            sizes: [[300, 250]]
          }
        }
      };
      videoBid = {
        bidder: 'adWMG',
        params: {
          publisherId: '5cebea3c9eea646c7b623d5e'
        },
        mediaTypes: {
          video: {
            context: 'instream',
            playerSize: [[640, 480]],
            mimes: ['video/mp4']
          }
        }
      };
    });

    it('should return true when valid banner bid request is set', function() {
      expect(spec.isBidRequestValid(bannerBid)).to.equal(true);
    });

    it('should return true when valid video bid request is set', function() {
      expect(spec.isBidRequestValid(videoBid)).to.equal(true);
    });

    it('should return false when publisherId param is not set', function() {
      delete bannerBid.params.publisherId;
      expect(spec.isBidRequestValid(bannerBid)).to.equal(false);
    });

    it('should return false for video bid without playerSize', function() {
      delete videoBid.mediaTypes.video.playerSize;
      expect(spec.isBidRequestValid(videoBid)).to.equal(false);
    });

    it('should return false for video bid with empty playerSize', function() {
      videoBid.mediaTypes.video.playerSize = [];
      expect(spec.isBidRequestValid(videoBid)).to.equal(false);
    });

    it('should return false for video bid without mimes', function() {
      delete videoBid.mediaTypes.video.mimes;
      expect(spec.isBidRequestValid(videoBid)).to.equal(false);
    });

    it('should return false for video bid with empty mimes', function() {
      videoBid.mediaTypes.video.mimes = [];
      expect(spec.isBidRequestValid(videoBid)).to.equal(false);
    });

    it('should return false when neither banner nor video mediaType is present', function() {
      const bid = {
        bidder: 'adWMG',
        params: { publisherId: '5cebea3c9eea646c7b623d5e' },
        mediaTypes: {}
      };
      expect(spec.isBidRequestValid(bid)).to.equal(false);
    });
  });

  describe('parseUserAgent', function() {
    let ua_desktop, ua_mobile, ua_tv, ua_tablet;
    beforeEach(function() {
      ua_desktop = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36';
      ua_tv = 'Mozilla/5.0 (Linux; NetCast; U) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.31 SmartTV/7.0';
      ua_mobile = 'Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-G610M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.2 Chrome/59.0.3071.125 Mobile Safari/537.36';
      ua_tablet = 'Mozilla/5.0 (iPad; CPU OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53';
    });

    it('should return correct device type: desktop', function() {
      const userDeviceInfo = spec.parseUserAgent(ua_desktop);
      expect(userDeviceInfo.devicetype).to.equal(2);
    });

    it('should return correct device type: TV', function() {
      const userDeviceInfo = spec.parseUserAgent(ua_tv);
      expect(userDeviceInfo.devicetype).to.equal(3);
    });

    it('should return correct device type: mobile', function() {
      const userDeviceInfo = spec.parseUserAgent(ua_mobile);
      expect(userDeviceInfo.devicetype).to.equal(4);
    });

    it('should return correct device type: tablet', function() {
      const userDeviceInfo = spec.parseUserAgent(ua_tablet);
      expect(userDeviceInfo.devicetype).to.equal(5);
    });

    it('should return correct OS name', function() {
      const userDeviceInfo = spec.parseUserAgent(ua_desktop);
      expect(userDeviceInfo.os).to.equal('Windows');
    });

    it('should return correct OS version', function() {
      const userDeviceInfo = spec.parseUserAgent(ua_desktop);
      expect(userDeviceInfo.osv).to.equal('10.0');
    });
  });

  describe('buildRequests', function () {
    let bannerBidRequests, videoBidRequests;
    const bidderRequest = {
      refererInfo: {
        page: 'https://test.com',
        domain: 'test.com',
        referer: 'https://test.com'
      },
      timeout: 3000,
      gdprConsent: {
        consentString: 'CO9rhBTO9rhBTAcABBENBCCsAP_AAH_AACiQHItf_X_fb3_j-_59_9t0eY1f9_7_v20zjgeds-8Nyd_X_L8X42M7vB36pq4KuR4Eu3LBIQdlHOHcTUmw6IkVqTPsbk2Mr7NKJ7PEinMbe2dYGH9_n9XTuZKY79_s___z__-__v__7_f_r-3_3_vp9V---3YHIgEmGpfARZiWOBJNGlUKIEIVxIdACACihGFomsICVwU7K4CP0EDABAagIwIgQYgoxZBAAAAAElEQEgB4IBEARAIAAQAqQEIACNAEFgBIGAQACgGhYARQBCBIQZHBUcpgQESLRQTyVgCUXexhhCGUUANAg4AA.YAAAAAAAAAAA',
        vendorData: {},
        gdprApplies: true,
        apiVersion: 2
      }
    };

    beforeEach(function() {
      bannerBidRequests = [
        {
          bidder: 'adWMG',
          adUnitCode: 'adwmg-test-ad',
          auctionId: 'test-auction-id',
          bidId: 'test-bid-id',
          bidRequestsCount: 1,
          bidderRequestId: 'bidderrequestid123',
          transactionId: 'transaction-id-123',
          sizes: [[300, 250]],
          requestId: 'requestid123',
          params: {
            publisherId: '5cebea3c9eea646c7b623d5e',
            floorCPM: 0.5
          },
          mediaTypes: {
            banner: {
              sizes: [[300, 250]]
            }
          },
          userId: {
            pubcid: 'pubc-id-123'
          }
        }, {
          bidder: 'adWMG',
          adUnitCode: 'adwmg-test-ad-2',
          auctionId: 'test-auction-id-2',
          bidId: 'test-bid-id-2',
          bidRequestsCount: 1,
          bidderRequestId: 'bidderrequestid456',
          transactionId: 'transaction-id-456',
          sizes: [[320, 50]],
          requestId: 'requestid456',
          params: {
            publisherId: '5cebea3c9eea646c7b623d5e'
          },
          mediaTypes: {
            banner: {
              sizes: [[320, 50]]
            }
          },
          userId: {
            pubcid: 'pubc-id-456'
          }
        }
      ];

      videoBidRequests = [
        {
          bidder: 'adWMG',
          adUnitCode: 'adwmg-video-ad',
          auctionId: 'test-auction-id-video',
          bidId: 'test-bid-id-video',
          bidRequestsCount: 1,
          bidderRequestId: 'bidderrequestid-video',
          transactionId: 'transaction-id-video',
          requestId: 'requestid-video',
          params: {
            publisherId: '5cebea3c9eea646c7b623d5e'
          },
          mediaTypes: {
            video: {
              context: 'instream',
              playerSize: [[640, 480]],
              mimes: ['video/mp4'],
              protocols: [1, 2, 3]
            }
          }
        }
      ];
    });

    it('should not contain sizes when sizes is not set', function() {
      delete bannerBidRequests[0].sizes;
      delete bannerBidRequests[1].sizes;
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(JSON.parse(requests[0].data).sizes).to.be.an('undefined');
      expect(JSON.parse(requests[1].data).sizes).to.be.an('undefined');
    });

    it('should not contain userId when userId is not set', function() {
      delete bannerBidRequests[0].userId;
      delete bannerBidRequests[1].userId;
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(JSON.parse(requests[0].data).userId).to.be.an('undefined');
      expect(JSON.parse(requests[1].data).userId).to.be.an('undefined');
    });

    it('should have a post method', function() {
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(requests[0].method).to.equal('POST');
      expect(requests[1].method).to.equal('POST');
    });

    it('should contain a request id equal to the bid id', function() {
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(JSON.parse(requests[0].data).requestId).to.equal(bannerBidRequests[0].bidId);
      expect(JSON.parse(requests[1].data).requestId).to.equal(bannerBidRequests[1].bidId);
    });

    it('should have a url that matches the default endpoint', function() {
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(requests[0].url).to.equal('https://hb.adwmg.com/hb');
      expect(requests[1].url).to.equal('https://hb.adwmg.com/hb');
    });

    it('should contain GDPR consent data if GDPR set', function() {
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(JSON.parse(requests[0].data).gdpr.applies).to.be.true;
      expect(JSON.parse(requests[0].data).gdpr.consentString).to.equal(bidderRequest.gdprConsent.consentString);
      expect(JSON.parse(requests[1].data).gdpr.applies).to.be.true;
      expect(JSON.parse(requests[1].data).gdpr.consentString).to.equal(bidderRequest.gdprConsent.consentString);
    });

    it('should not contain GDPR consent data if GDPR not set', function() {
      const noBidderRequest = Object.assign({}, bidderRequest);
      delete noBidderRequest.gdprConsent;
      const requests = spec.buildRequests(bannerBidRequests, noBidderRequest);
      expect(JSON.parse(requests[0].data).gdpr).to.be.an('undefined');
      expect(JSON.parse(requests[1].data).gdpr).to.be.an('undefined');
    });

    it('should set debug mode in requests if enabled', function() {
      sinon.stub(config, 'getConfig').withArgs('debug').returns(true);
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(JSON.parse(requests[0].data).debug).to.be.true;
      expect(JSON.parse(requests[1].data).debug).to.be.true;
      config.getConfig.restore();
    });

    it('should use getFloor() value when available', function() {
      const floorBid = Object.assign({}, bannerBidRequests[0], {
        getFloor: () => ({ currency: 'USD', floor: 1.5 })
      });
      const requests = spec.buildRequests([floorBid], bidderRequest);
      expect(JSON.parse(requests[0].data).adUnit.bids.params.floorCPM).to.equal(1.5);
    });

    it('should fall back to params.floorCPM when getFloor is not available', function() {
      const requests = spec.buildRequests(bannerBidRequests, bidderRequest);
      expect(JSON.parse(requests[0].data).adUnit.bids.params.floorCPM).to.equal(0.5);
    });

    it('should read schain from ortb2.source.ext.schain', function() {
      const schain = { ver: '1.0', complete: 1, nodes: [{ asi: 'test.com', sid: '1', hp: 1 }] };
      const bidWithSchain = Object.assign({}, bannerBidRequests[0], {
        ortb2: { source: { ext: { schain } } }
      });
      const requests = spec.buildRequests([bidWithSchain], bidderRequest);
      expect(JSON.parse(requests[0].data).supplyChain).to.deep.equal(schain);
    });

    it('should fall back to legacy bidRequest.schain when ortb2 path is not set', function() {
      const schain = { ver: '1.0', complete: 1, nodes: [{ asi: 'legacy.com', sid: '2', hp: 1 }] };
      const bidWithLegacySchain = Object.assign({}, bannerBidRequests[0], { schain });
      const requests = spec.buildRequests([bidWithLegacySchain], bidderRequest);
      expect(JSON.parse(requests[0].data).supplyChain).to.deep.equal(schain);
    });

    it('should build a video bid request correctly', function() {
      const requests = spec.buildRequests(videoBidRequests, bidderRequest);
      expect(requests).to.have.length(1);
      const data = JSON.parse(requests[0].data);
      expect(data.adUnit.mediaTypes.video).to.exist;
      expect(data.adUnit.mediaTypes.video.playerSize).to.deep.equal([[640, 480]]);
      expect(data.adUnit.mediaTypes.video.mimes).to.deep.equal(['video/mp4']);
    });

    it('should attach bidRequest to the returned request object', function() {
      const requests = spec.buildRequests(videoBidRequests, bidderRequest);
      expect(requests[0].bidRequest).to.equal(videoBidRequests[0]);
    });
  });

  describe('interpretResponse', function () {
    let bannerServerResponse, videoServerResponse;
    beforeEach(function() {
      bannerServerResponse = {
        body: {
          'requestId': 'request-id',
          'cpm': 100,
          'width': 300,
          'height': 250,
          'ad': '<div>ad</div>',
          'ttl': 300,
          'creativeId': 'creative-id',
          'netRevenue': true,
          'currency': 'USD',
          'adomain': ['testdomain.com']
        }
      };
      videoServerResponse = {
        body: {
          'requestId': 'request-id-video',
          'cpm': 5,
          'width': 640,
          'height': 480,
          'vastXml': '<VAST version="4.0"></VAST>',
          'ttl': 300,
          'creativeId': 'creative-id-video',
          'netRevenue': true,
          'currency': 'USD',
          'adomain': ['videodomain.com']
        }
      };
    });

    it('should return a valid banner response', () => {
      const responses = spec.interpretResponse(bannerServerResponse);
      expect(responses).to.be.an('array').that.is.not.empty;

      const response = responses[0];
      expect(response).to.have.all.keys(
        'requestId', 'cpm', 'width', 'height', 'meta', 'ad',
        'ttl', 'creativeId', 'netRevenue', 'currency', 'mediaType'
      );
      expect(response.requestId).to.equal('request-id');
      expect(response.cpm).to.equal(100);
      expect(response.width).to.equal(300);
      expect(response.height).to.equal(250);
      expect(response.ad).to.equal('<div>ad</div>');
      expect(response.ttl).to.equal(300);
      expect(response.creativeId).to.equal('creative-id');
      expect(response.netRevenue).to.be.true;
      expect(response.currency).to.equal('USD');
      expect(response.meta.advertiserDomains[0]).to.equal('testdomain.com');
      expect(response.meta.mediaType).to.equal('banner');
      expect(response.mediaType).to.equal('banner');
    });

    it('should return a valid video (instream) response', () => {
      const httpRequest = {
        bidRequest: {
          mediaTypes: {
            video: {
              context: 'instream',
              playerSize: [[640, 480]],
              mimes: ['video/mp4']
            }
          }
        }
      };
      const responses = spec.interpretResponse(videoServerResponse, httpRequest);
      expect(responses).to.be.an('array').that.is.not.empty;

      const response = responses[0];
      expect(response.mediaType).to.equal('video');
      expect(response.meta.mediaType).to.equal('video');
      expect(response.vastXml).to.equal('<VAST version="4.0"></VAST>');
      expect(response.ad).to.be.an('undefined');
      expect(response.meta.advertiserDomains[0]).to.equal('videodomain.com');
    });

    it('should use vastUrl when present in video response', () => {
      const vastUrlResponse = {
        body: Object.assign({}, videoServerResponse.body, {
          vastXml: undefined,
          vastUrl: 'https://example.com/vast.xml'
        })
      };
      const responses = spec.interpretResponse(vastUrlResponse, {});
      expect(responses[0].mediaType).to.equal('video');
      expect(responses[0].vastUrl).to.equal('https://example.com/vast.xml');
    });

    it('should fall back to playerSize from bid request when response has no dimensions', () => {
      const noDimsResponse = {
        body: Object.assign({}, videoServerResponse.body, { width: undefined, height: undefined })
      };
      const httpRequest = {
        bidRequest: {
          mediaTypes: {
            video: { playerSize: [[1280, 720]], mimes: ['video/mp4'] }
          }
        }
      };
      const responses = spec.interpretResponse(noDimsResponse, httpRequest);
      expect(responses[0].width).to.equal(1280);
      expect(responses[0].height).to.equal(720);
    });

    it('should return an empty array when serverResponse is empty', () => {
      const responses = spec.interpretResponse({});
      expect(responses).to.deep.equal([]);
    });
  });

  describe('getUserSyncs', function () {
    it('should return nothing when sync is disabled', function () {
      const syncOptions = {
        'iframeEnabled': false,
        'pixelEnabled': false
      };

      const syncs = spec.getUserSyncs(syncOptions);
      expect(syncs).to.deep.equal([]);
    });

    it('should register iframe sync when only iframe is enabled', function () {
      const syncOptions = {
        'iframeEnabled': true,
        'pixelEnabled': false
      };

      const syncs = spec.getUserSyncs(syncOptions);
      expect(syncs[0].type).to.equal('iframe');
      expect(syncs[0].url).includes('https://hb.adwmg.com/cphb.html?');
    });

    it('should register iframe sync when iframe and image are enabled', function () {
      const syncOptions = {
        'iframeEnabled': true,
        'pixelEnabled': true
      };

      const syncs = spec.getUserSyncs(syncOptions);
      expect(syncs[0].type).to.equal('iframe');
      expect(syncs[0].url).includes('https://hb.adwmg.com/cphb.html?');
    });

    it('should send GDPR consent if enabled', function() {
      const syncOptions = {
        'iframeEnabled': true,
        'pixelEnabled': true
      };
      const gdprConsent = {
        consentString: 'CO9rhBTO9rhBTAcABBENBCCsAP_AAH_AACiQHItf_X_fb3_j-_59_9t0eY1f9_7_v20zjgeds-8Nyd_X_L8X42M7vB36pq4KuR4Eu3LBIQdlHOHcTUmw6IkVqTPsbk2Mr7NKJ7PEinMbe2dYGH9_n9XTuZKY79_s___z__-__v__7_f_r-3_3_vp9V---3YHIgEmGpfARZiWOBJNGlUKIEIVxIdACACihGFomsICVwU7K4CP0EDABAagIwIgQYgoxZBAAAAAElEQEgB4IBEARAIAAQAqQEIACNAEFgBIGAQACgGhYARQBCBIQZHBUcpgQESLRQTyVgCUXexhhCGUUANAg4AA.YAAAAAAAAAAA',
        vendorData: {},
        gdprApplies: true,
        apiVersion: 2
      };
      const serverResponse = {};
      const syncs = spec.getUserSyncs(syncOptions, serverResponse, gdprConsent);
      expect(syncs[0].url).includes('gdpr=1');
      expect(syncs[0].url).includes(`gdpr_consent=${gdprConsent.consentString}`);
    });

    it('should not add GDPR consent params twice', function() {
      const syncOptions = {
        'iframeEnabled': true,
        'pixelEnabled': true
      };
      const gdprConsent = {
        consentString: 'CO9rhBTO9rhBTAcABBENBCCsAP_AAH_AACiQHItf_X_fb3_j-_59_9t0eY1f9_7_v20zjgeds-8Nyd_X_L8X42M7vB36pq4KuR4Eu3LBIQdlHOHcTUmw6IkVqTPsbk2Mr7NKJ7PEinMbe2dYGH9_n9XTuZKY79_s___z__-__v__7_f_r-3_3_vp9V---3YHIgEmGpfARZiWOBJNGlUKIEIVxIdACACihGFomsICVwU7K4CP0EDABAagIwIgQYgoxZBAAAAAElEQEgB4IBEARAIAAQAqQEIACNAEFgBIGAQACgGhYARQBCBIQZHBUcpgQESLRQTyVgCUXexhhCGUUANAg4AA.YAAAAAAAAAAA',
        vendorData: {},
        gdprApplies: true,
        apiVersion: 2
      };
      const gdprConsent2 = {
        consentString: 'CO9rhBTO9rhBTAcABBENBCCsAP_AAH_AACiQHItf_7_fb3_j-_59_9t0eY1f9_7_v20zjgeds-8Nyd_X_L8X42M7vB36pq4KuR4Eu3LBIQdlHOHcTUmw6IkVqTPsbk2Mr7NKJ7PEinMbe2dYGH9_n9XTuZKY79_s___z__-__v__7_f_r-3_3_vp9V---3YHIgEmGpfARZiWOBJNGlUKIEIVxIdACACihGFomsICVwU7K4CP0EDABAagIwIgQYgoxZBAAAAAElEQEgB4IBEARAIAAQAqQEIACNAEFgBIGAQACgGhYARQBCBIQZHBUcpgQESLRQTyVgCUXexhhCGUUANAg4AA.YAAAAAAAAAAA',
        vendorData: {},
        gdprApplies: true,
        apiVersion: 2
      };
      const serverResponse = {};
      let syncs = spec.getUserSyncs(syncOptions, serverResponse, gdprConsent);
      syncs = spec.getUserSyncs(syncOptions, serverResponse, gdprConsent2);
      expect(syncs[0].url.match(/gdpr/g).length).to.equal(2); // gdpr + gdpr_consent
      expect(syncs[0].url.match(/gdpr_consent/g).length).to.equal(1);
    });

    it('should delete \'&\' symbol at the end of usersync URL', function() {
      const syncOptions = {
        'iframeEnabled': true,
        'pixelEnabled': true
      };
      const gdprConsent = {
        consentString: 'CO9rhBTO9rhBTAcABBENBCCsAP_AAH_AACiQHItf_X_fb3_j-_59_9t0eY1f9_7_v20zjgeds-8Nyd_X_L8X42M7vB36pq4KuR4Eu3LBIQdlHOHcTUmw6IkVqTPsbk2Mr7NKJ7PEinMbe2dYGH9_n9XTuZKY79_s___z__-__v__7_f_r-3_3_vp9V---3YHIgEmGpfARZiWOBJNGlUKIEIVxIdACACihGFomsICVwU7K4CP0EDABAagIwIgQYgoxZBAAAAAElEQEgB4IBEARAIAAQAqQEIACNAEFgBIGAQACgGhYARQBCBIQZHBUcpgQESLRQTyVgCUXexhhCGUUANAg4AA.YAAAAAAAAAAA',
        vendorData: {},
        gdprApplies: true,
        apiVersion: 2
      };
      const serverResponse = {};
      const syncs = spec.getUserSyncs(syncOptions, serverResponse, gdprConsent);
      expect(syncs[0].url.slice(-1)).to.not.equal('&');
    });
  });
});
