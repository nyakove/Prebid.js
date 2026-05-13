# Overview

```
Module Name: adWMG Adapter
Module Type: Bidder Adapter
Maintainer: wbid@adwmg.com
```

# Description

Module that connects to adWMG demand sources to fetch bids. Supports `banner` and `video` (instream) ad formats.

# Bid Parameters

| Key             | Required | Example                      | Description                     |
| --------------- | -------- | -----------------------------| ------------------------------- |
| `publisherId`   | yes      | `'5cebea3c9eea646c7b623d5e'` | Publisher ID from WMG Dashboard |
| `IABCategories` | no       | `['IAB1', 'IAB5']`           | IAB ad categories for adUnit    |
| `floorCPM`      | no       | `0.5`                        | Floor price for adUnit (USD). Also supports the Prebid [Price Floors Module](https://docs.prebid.org/dev-docs/modules/floors.html). |

# Test Parameters

## Banner

```javascript
var adUnits = [{
  code: 'wmg-test-div',
  mediaTypes: {
    banner: {
      sizes: [[300, 250]]
    }
  },
  bids: [{
    bidder: 'adWMG',
    params: {
      publisherId: '5cebea3c9eea646c7b623d5e',
      IABCategories: ['IAB1', 'IAB5']
    }
  }]
}]
```

## Video (Instream)

```javascript
var adUnits = [{
  code: 'wmg-video-div',
  mediaTypes: {
    video: {
      context: 'instream',
      playerSize: [[640, 480]],
      mimes: ['video/mp4', 'video/ogg', 'video/webm'],
      protocols: [1, 2, 3, 4, 5, 6],
      maxduration: 30,
      api: [1, 2]
    }
  },
  bids: [{
    bidder: 'adWMG',
    params: {
      publisherId: '5cebea3c9eea646c7b623d5e'
    }
  }]
}]
```