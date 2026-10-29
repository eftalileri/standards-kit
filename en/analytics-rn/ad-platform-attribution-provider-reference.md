# Ad-platform attribution -- provider reference and checklists (non-normative, optional adapter)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of [Ad-platform install and conversion attribution](ad-platform-attribution.md). This file is an optional adapter: it uses Apple, Google and Meta as the example provider set, and a project using other providers writes the equivalent fact sheet. It carries example provider contract facts the owner-path schemas mirror, the retry table, the verification and go-live checklists, and the source list; the adopting project records the documentation date it checked beside each source. It defines no rule ID and adds no obligation; every obligation it serves is an **ADA-** row in [ad-platform-attribution.md](ad-platform-attribution.md). When a fact here disagrees with the provider's current page, the provider wins and the project's copy of this fact sheet is corrected (**ADA-M14**).

---

## Apple

**AdServices token.** `AAAttribution.attributionToken()` (iOS / iPadOS / Mac Catalyst 14.3+, macOS 11.1+, visionOS 1.0+) returns a Base64 string with a 24-hour TTL. Errors (`AAAttributionError.Code`): `networkError` (no internet; transient), `internalError` (`failed`; Apple gives no retry guidance, so a fresh token at a later cold start, bounded), `platformNotSupported` (`unavailable`). A new token may be minted at any time; an expired one is never re-sent. No ATT prompt is needed: Apple states AdServices "does not engage in tracking" as ATT defines it.

**Attribution API.** `POST https://api-adservices.apple.com/api/v1/`, `Content-Type: text/plain`, body = the token.

| Status | Meaning (Apple) | Outcome / action |
|--------|-----------------|------------------|
| `200` | Record returned; `attribution: true` when matched, `false` when no match or the ad group uses age / gender settings | `resolved` |
| `400` | Token invalid | defect; not retried as-is |
| `404` | Record not available yet, or token older than 24 h | within TTL retry every 5 s, at most 3 times; past TTL mint a new token |
| `500` | Apple Ads server temporarily down | retry later |

Apple may hold a connection up to 1 s before answering `404`; a shorter client timeout produces false timeouts.

**Record fields** (types as Apple documents them; optionality inferred where Apple does not state it):

| Field | Type | Notes |
|-------|------|-------|
| `attribution` | boolean | the only field the verdict cannot do without |
| `orgId`, `campaignId`, `adGroupId` | long (signed 64-bit) | no range promise |
| `adId` | long | iOS 15.2+ devices only |
| `keywordId` | long | absent when search match is on |
| `conversionType` | string | `Download`, `Redownload`, `PreOrder` |
| `claimType` | string | `Click`, `Impression` |
| `clickDate` / `impressionDate` | date-time string (UTC) | Apple's samples are minute precision (`2024-10-08T17:17Z`) and no precision is promised; which one appears depends on `claimType` |
| `countryOrRegion` | string | |
| `supplyPlacement` | string | `APPSTORE_SEARCH_RESULTS`, `APPSTORE_SEARCH_TAB`, `APPSTORE_TODAY_TAB`, `APPSTORE_PRODUCT_PAGES` |

Windows: tap-through 30 days, view-through 24 h; pre-order lookback 90 days (click) / 61 days (view). Developer Mode returns the fixed test payload (`orgId` / `campaignId` / `adGroupId` = `1234567890`, `keywordId` = `123222`).

**AdAttributionKit / SKAdNetwork.** AdAttributionKit (iOS 17.4+) succeeds SKAdNetwork for App Store and alternative-marketplace ads; the device considers impressions from both when choosing one winner. Postbacks go to the ad network (copies to the developer's endpoint if opted in), carry no user or device data, arrive no sooner than 24--48 h after the conversion (5--10 min for development postbacks with Developer Mode), and up to five non-winning networks get a `did-win: false` postback. The app registers by updating the conversion value at first launch. ATT is not required for these APIs. Testing needs a production Apple ID; development impressions use publisher item id `0`.

**Privacy manifest.** `PrivacyInfo.xcprivacy` declares `NSPrivacyTracking`, tracking domains and collected data types; the app-level declaration must match the bundled SDKs ([PAN-RN-N5](analytics-rn.md)).

## Google Play Install Referrer

Library `com.android.installreferrer:installreferrer:2.2`. Read once on the first run after install; the value stays the same for 90 days unless the app is reinstalled; call `endConnection()` afterwards. Details: `installReferrer` (URL-encoded query string), `referrerClickTimestampSeconds`, `installBeginTimestampSeconds`, `googlePlayInstantParam`. No maximum referrer length is documented.

| Response | Outcome / action |
|----------|------------------|
| `OK` | read details, `resolved` |
| `FEATURE_NOT_SUPPORTED` | `unavailable` (Play Store app lacks the API) |
| `SERVICE_UNAVAILABLE` | `failed`; retry at a later cold start, bounded (Google does not call it transient) |
| `SERVICE_DISCONNECTED` | transient (Google: "feel free to introduce your retry policy"); `startConnection()` again |
| `DEVELOPER_ERROR` | defect (incorrect usage) |
| `PERMISSION_ERROR` (2.2+) | app not allowed to bind the service; library 2.2+ declares the bind permission in its own manifest, so a refusal means the merged manifest lost it: `failed`, defect (`SYSTEM`) |

## Meta

**Encrypted referrer (Play transport).** The Play referrer's `utm_content` JSON holds `source.data` (hex ciphertext with the 16-byte GCM tag appended) and `source.nonce` (hex, 12 bytes). Decrypt with AES-256-GCM, empty associated data, the 64-hex-character "Install Referrer Decryption Key" from App Dashboard > Settings > Basic > Android. Meta's text says the tag "can be ignored or trimmed"; a verifying AEAD decrypt consumes and checks it instead (**ADA-N3**). `utm_source` is not proof of a Meta install.

**Content-provider path (Meta Install Referrer).** Query `content://com.facebook.katana.provider.InstallReferrerProvider/<app id>`, `content://com.instagram.contentprovider.InstallReferrerProvider/<app id>` and `content://com.facebook.lite.provider.InstallReferrerProvider/<app id>` with projection `install_referrer`, `is_ct` (1 click-through, 0 view-through), `actual_timestamp` (seconds). Needs `<queries>` for `com.facebook.katana`, `com.instagram.android`, `com.facebook.lite`; minimum app versions Facebook 428, Instagram 296, Facebook Lite 411. The `install_referrer` value carries the same encrypted `utm_content.source`. Meta: for click-through installs it equals the Play referrer (deduplicate on it); view-through and cross-session click-through installs reach only this path.

**Decrypted payload.** Fields: `account_id`, `ad_id`, `adgroup_id`, `adgroup_name`, `campaign_id`, `campaign_name`, `campaign_group_id`, `campaign_group_name`, `ad_objective_name`; Instagram ads add `is_instagram` (boolean), `publisher_platform`, `platform_position`. Meta's samples quote ids as strings; a measurement partner's published decrypted example shows unquoted 15--17 digit integers (third-party, see sources). Meta states the metadata "is subject to change": every field optional, unknown keys ignored. The ids use the legacy Marketing API vocabulary: `campaign_group_id` = campaign, `campaign_id` = ad set, `adgroup_id` = ad (measurement partners map the same way: `adgroup_name` / `adgroup_id` → ad name and id). `ad_id` is not the ad: it has been observed to resolve to no Graph object while the campaign and ad-set ids matched. Read the ad from `adgroup_id`, and confirm the mapping against the ad account's live object list.

**Conversions API for app events.** `action_source: "app"`; `app_data.advertiser_tracking_enabled` (0/1, the iOS ATT status) and `app_data.extinfo` (version `a2` Android / `i2` iOS, positional, empty strings for unknown values) are required. `user_data.anon_id` and `madid` are sent unhashed. Deduplication: `event_name` + `event_id`, 48-hour window, Meta generally keeps the event received first; install events keep the first one received from any source within 90 days. `event_time` older than 7 days fails the whole request. Limited Data Use: `data_processing_options: ["LDU"]` with `data_processing_options_country` / `_state`. Test with the Events Manager Test Events tool. Meta requires the dataset to be linked to the app before mobile app events are sent; `application_tracking_enabled` is optional and `client_ip_address` is sent unhashed. Meta documents no minimum delay between the SDK install report and a server app event; the delay in **ADA-M17** is measured by the adopting project. A Test Events receipt proves the body was accepted, not that the event will be attributed (**ADA-M22**).

**Ad reporting of app conversions.** Ads insights report a server app event `StartTrial` only in the `conversions` field, keys `start_trial_mobile_app` and `start_trial_total` ("Mobile App Trials Started" in the ads action stats reference); the `actions` list carries no trial key, so a lookup there reads 0 for a trial Meta counts. Registration is in `actions` as `complete_registration` and `app_custom_event.fb_mobile_complete_registration`. Custom app event names (anything outside Meta's standard list) are aggregated as `app_custom_event.other` with no per-name split. The app's `app_event_types` lists the server app event names received through a dataset linked to the app; the dataset's Graph `/stats` omits app events and is no count of them. Learning phase: Meta states an ad set needs about 50 optimization events in 7 days after the last significant edit to leave learning (**ADA-M25**).

**Apple Ads conversions.** Apple Ads attributes installs (AdServices record per install, AdAttributionKit / SKAdNetwork postbacks per campaign); it has no per-install server conversion upload. Post-install value reaches Apple only through the conversion value set on the device (`updateConversionValue`, per postback type from iOS 18, fine values only above Apple's crowd-anonymity threshold, later windows coarse only) (**ADA-M24**).

**iOS.** Meta measures iOS 14.5+ app campaigns through Aggregated Event Measurement or SKAdNetwork, selected per ad set by `campaign_attribution`; the promoted app needs Meta SDK 8.0+. Meta iOS SDK 17+ on iOS 17+ reads `ATTrackingManager` status itself and the advertiser-tracking setter is deprecated.

## Click identifiers

| Id | Provider statement | Bound |
|----|--------------------|-------|
| `fbclid` | case-sensitive, "do not apply any modifications"; no length stated | abuse limit with wide headroom over measured real values ([MRP-M15](../monorepo/monorepo-rules.md) note (b), [ADA-M11](ad-platform-attribution.md)) |
| `gclid` / `gbraid` / `wbraid` | `gclid` case-sensitive; no length stated | same |
| `ttclid` | no official format or length found | same |

---

## Pre-campaign verification checklist

Serves [ADA-M13](ad-platform-attribution.md). Evidence is a real run; a probe script lives outside the repository.

1. Apple -- Developer Mode on a physical device: the server receives the fixed test payload, tags it as test and excludes it from every metric (**ADA-N4**).
2. Apple -- Developer Mode off, store or TestFlight build: the exchange returns `200`; a `404`, when one occurs, is retried at 5 s intervals at most three times (the exchange log shows the attempts); a token held past 24 h is replaced, not re-sent.
3. Apple -- simulator: outcome `unavailable`, no defect report.
4. Play -- install from a Play test track through `https://play.google.com/store/apps/details?id=<package>&referrer=<url-encoded params>`: the server receives the parameters byte-identical; a second launch does not re-read; a sideloaded build yields `unavailable`.
5. Meta -- the decryption key is present only in the server secret store; one real install from a minimal-budget test ad set decrypts, the tag verifies, the record is classified paid Meta with lossless ids, and each stored id (campaign, ad set, ad) is found in the ad account's live object list (Graph) — an id that resolves to no object is a mapping defect, not an unknown ad.
6. Meta -- tamper probe in a scratch script: one changed ciphertext hex digit fails the tag and is reported once as a link-input failure (`BUSINESS`, expected channel); it never yields a Meta verdict.
7. Malformed-field probes through the real shared schema in a scratch script: id as quoted string, as unquoted integer above 2^53, as float, as negative, missing, an unknown extra key, an over-limit name -- each id round-trips digit-exact or is omitted with one drift report, and the record survives (**ADA-M2**, **ADA-M3**).
8. Web handoff: a landing URL with a long mixed-case synthetic click id reaches the server byte-identical; one over the abuse limit is omitted and reported while the rest of the record is kept (**ADA-M11**).
9. Conversion events: one event sent from the SDK and the server with the same `event_id` appears once in the platform's test-events tool (**ADA-M12**).
10. Conversion delivery on the store build: the SDK install report leaves the device in the first session; the server sends the conversion after the delay with `action_source: "app"`, `extinfo`, `anon_id`, IP and user agent; the delivery record holds Meta's `events_received` and trace id; the campaign's optimization event equals the sent name (**ADA-M16**--**ADA-M20**).
11. Proof: the first real ad-sourced conversions after go-live appear in the platform's per-ad report within the grace, read from the named field and key (Meta trial: `conversions` / `start_trial_mobile_app`), and the mirror classifies each one (**ADA-M21**, **ADA-M22**).
12. Learning volume: the weekly optimization-event estimate per ad set at the planned budget is computed and compared with the platform's threshold (**ADA-M25**).

## Go-live checklist

1. The store build that embeds the capture code is rolled out to the whole production track ([PAN-RN-M11](analytics-rn.md)).
2. Dashboards show per-platform capture-health rates with `unavailable` excluded (**ADA-M5**).
3. Drift codes reach the error tracker once per process; expected outcomes stay on the metric channel (**ADA-M8**).
4. The first real install and first real conversion from each provider are inspected end to end: record, verdict, dashboard.
5. The source list below carries the date of the schema re-check (**ADA-M14**).

---

## Sources (record the date checked beside each)

| Source | URL | Version / date checked |
|--------|-----|----------------|
| Apple -- `attributionToken()` and Attribution API | https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken() | (adopting project records) |
| Apple -- AdServices changelog | https://developer.apple.com/documentation/adservices/changelog | (adopting project records) |
| Apple -- `AAAttributionError.Code` | https://developer.apple.com/documentation/adservices/aaattributionerror/code | (adopting project records) |
| Apple Ads -- Measuring performance of ads on the App Store | https://ads.apple.com/app-store/help/attribution/0028-measuring-ad-performance | (adopting project records) |
| Apple -- AdAttributionKit | https://developer.apple.com/documentation/adattributionkit | (adopting project records) |
| Apple -- Receiving ad attributions and postbacks | https://developer.apple.com/documentation/adattributionkit/receiving-ad-attributions-and-postbacks | (adopting project records) |
| Apple -- Testing AdAttributionKit with Developer Mode | https://developer.apple.com/documentation/adattributionkit/testing-adattributionkit-with-developer-mode | (adopting project records) |
| Apple -- SKAdNetwork | https://developer.apple.com/documentation/storekit/skadnetwork | (adopting project records) |
| Apple -- Privacy manifest files | https://developer.apple.com/documentation/bundleresources/privacy-manifest-files | (adopting project records) |
| Google -- Play Install Referrer library | https://developer.android.com/google/play/installreferrer/library | (adopting project records) |
| Google -- `InstallReferrerResponse` | https://developer.android.com/reference/com/android/installreferrer/api/InstallReferrerClient.InstallReferrerResponse | (adopting project records) |
| Google -- Install Referrer release notes | https://developer.android.com/google/play/installreferrer/release-notes | (adopting project records) |
| Google Ads -- offline conversions with GCLID | https://support.google.com/google-ads/answer/7012522 | (adopting project records) |
| Meta -- Understand App Ads Referral URLs | https://developers.facebook.com/docs/app-ads/install-referrer | (adopting project records) |
| Meta -- Meta Install Referrer | https://developers.facebook.com/docs/app-ads/meta-install-referrer | (adopting project records) |
| Meta -- Conversions API for App Events | https://developers.facebook.com/docs/marketing-api/conversions-api/app-events | (adopting project records) |
| Meta -- Server event parameters | https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event | (adopting project records) |
| Meta -- Deduplicate pixel and server events | https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events | (adopting project records) |
| Meta -- Ads Action Stats (insights action and conversion keys) | https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/ | (adopting project records) |
| Meta -- About the learning phase | https://www.facebook.com/business/help/112167992830700 | (adopting project records) |
| Meta -- `fbp` and `fbc` parameters | https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc | (adopting project records) |
| Meta -- AEM and limitations of SKAdNetwork | https://developers.facebook.com/docs/app-ads/SKAdNetwork-aem-and-limitations/ | (adopting project records) |
| Meta -- Advertiser Tracking Enabled | https://developers.facebook.com/docs/app-events/guides/advertising-tracking-enabled | (adopting project records) |
| Third party -- Airbridge, Meta Google Play Install Referrer guide (unquoted large-integer ids) | https://help.airbridge.io/en/guides/meta-business-google-play-install-referrer | (adopting project records) |
| Third party -- Adjust, Meta raw data reporting for Android (MIR vs Play referrer) | https://help.adjust.com/en/article/facebook-raw-data-reporting-for-android | (adopting project records) |
