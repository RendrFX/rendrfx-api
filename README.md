# RendrFX REST API documentaiton


## RendrFX API Summary
The API is organized around the following resources -

| API Area | Resource | Description |
| --- | --- | --- |
| Templates | https://api.rendrfx.com/v1/templates | This endpoint will list the available templates.|
| Templates | https://api.rendrfx.com/v1/templates/:template_id | This endpoint will display information about the template, such as available inputs and media preview file urls.|
| Videos | https://api.rendrfx.com/v1/videos/create | This endpoint will allow for a video job to be created |
| Videos | https://api.rendrfx.com/v1/videos/status/:job_id | This endpoint will allow for a video job status to be accessed |

**Job Completed Payload Delivery**

Payload will be delivered via server to server webhook.

## Authentication token

RendrFX requires you send an authentication token along with a timestamp with each request made.

* To generate this token you will need to create a HMAC hash using SHA-256 algorithm.
* The key for this hash is `apiSecretKey + timestamp`.
* The hash must then be signed using your `appId`;
* The hash must then be encoded using `hex` encoding

Here is an example using Node.

```javascript
import crypto from 'crypto'

const appId = 'your app id';
const apiSecretKey = 'your secret key';

// Generate HMAC
const unixTimeInMilliseconds = manualDateInMilliseconds || Date.now(); //Generate timestamp
const key = apiSecretKey + unixTimeInMilliseconds; //Create key for hash
const hmac = crypto.createHmac('sha256', key); // Create HMAC instance
hmac.update(appId); //Sign using appId


//These two values need to be sent with every request
const token = hmac.digest('hex'); //Encode using hex encoding
const timestamp = unixTimeInMilliseconds;
```

**Bad request response messages**

This table shows a list of common responses you will receive when a request fails due to a bad token, timestamp or app id.

| Message | Response Code | Description |
| ------- | ------------- | ----------- |
| Token has expired | 406 | The generated token has expired. Time to live is 3 minutes. |
| Timestamp is invalid | 406 | The timestamp is a bad format or the timestamp received has a time that exceeds our endpoint's server time.|
| Invalid token | 406 | The token has not been properly constructed, meaning one of the values of `timestamp`, `apiSecretKey` & `appId` is incorrect. |
| Invalid APP ID | 403 | The app id does not exist. |

# Templates
The templates resource allows you to get information about the templates that are available to your account. Templates can be viewed individually or as a list.

## List all templates
You can fetch a list of available templates.

* `https://api.rendrfx.com/v1/templates`

**Request parameters**

| Query Parameters | Required | Description |
| --- | --- | --- |
| token | yes | The security token generated using HMAC SHA-256 |
| timestamp | yes | The timestamp in milleseconds used to generate the token.|

**Example list templates request**

```shell
$ curl \
-s https://api.rendrfx.com/v1/templates?token=c54c41281c45bfb2d7b86b56ff89961290b406f66cec6431dccce859a4a8522f&timestamp=1482246580660 \
-H 'X-API-Appid: yourAppId' \
-H 'Accept:application/json'
```

### Returns
A list of templates. The templates list contains an array of template objects.

## View an individual template

Each template object has its own URL -

* `https://api.rendrfx.com/v1/templates/:template_id`

Where `:template_id` is the value of the template's id field. This URL is the templates's canonical address in the API.

**Request parameters**

| Path Parameters | Query Parameters | Required | Description |
| --- | --- | --- | --- |
| | token | yes | The security token generated using HMAC SHA-256 |
| | timestamp | yes | The timestamp in milleseconds used to generate the token.|
| template_id | | yes | The id defined for the template. |

**Example view template request**

```shell
$ curl \
-s https://api.rendrfx.com/v1/templates/-KR_Tor-2oEhEh8vJpAO?token=c54c41281c45bfb2d7b86b56ff89961290b406f66cec6431dccce859a4a8522f&timestamp=1482246580660 \
-H 'X-API-Appid: yourAppId' \
-H 'Accept:application/json'
```


### Returns
A template object.

# Videos
The videos resource allows you to create video jobs and get information the status of the jobs.


## Create a video
Videos can be created via a `POST` method to `https://api.rendrfx.com/v1/videos/create`

**Attributes**
The table below shows the fields you can add to create a video

| Parameters | Required | Description |
| --- | --- | --- |
| scenes | yes | An array of scene objects.|
| sound | no | A url to an audio file to add to the overall video. |
| token | yes | The security token generated using HMAC SHA-256 |
| timestamp | yes | The timestamp in milleseconds used to generate the token.|

**Example create video request**
```shell
$ curl https://api.rendrfx.com/v1/videos/create \
-X POST \
-H 'X-API-Appid: yourAppId' \
-H 'Accept:application/json' \
-H 'Content-Type: application/json' -d '
{
   "scenes":[
      {
         "media":[
            "https://s3.amazonaws.com/re.bucket/images/re.logo.square.png"
         ],
         "text":[
            "www.websiteurl.com"
         ],
         "color":[{
             "r":40,
             "g":109,
             "b":73,
             "label":"text"
         }]
      }
   ],
   "audio":"www.url.com/to/audio/file.mp3",
   "token":"c54c41281c45bfb2d7b86b56ff89961290b406f66cec6431dccce859a4a8522f",
   "timestamp":1482246580660
}'
```

### Returns
A job object.  An example job object JSON would look like this `{"jobId": "-KR3g3BhjmS00k3vMmJC"}`.

## View status of a video
Each video job will have it's own status URL -

* `https://api.rendrfx.com/v1/videos/status/:job_id`

Where `:job_id` is the value of the video job id returned by the create video endpoint. This URL is the canonical address in the API.

**Request parameters**

| Path Parameters | Query Parameters | Required | Description |
| --- | --- | --- | --- |
| job_id | | yes | The id defined for the video job. |
| | token | yes | The security token generated using HMAC SHA-256 |
| | timestamp | yes | The timestamp in milleseconds used to generate the token.|

**Example video status request**

```shell
$ curl \
-s https://api.rendrfx.com/v1/videos/status/-KR3g3BhjmS00k3vMmJC?token=c54c41281c45bfb2d7b86b56ff89961290b406f66cec6431dccce859a4a8522f&timestamp=1482246580660 \
-H 'X-API-Appid: yourAppId' \
-H 'Accept:application/json'
```
### Returns
A video status object.

### Template Object

A template object contains the following fields.

| Attribute | Type | Description |
| --- | --- | --- |
| name | string | The name of the template |
| id | string | The RendrFX defined id representing the template. |
| seconds | integer | The template duration in seconds |
| mediaInputs | integer | The number of available customizable media inputs in this template |
| textInputs | integer | The number of available customizable text inputs in this template |
| colorInputs | integer | The number of available customizable color inputs in this template |
| previewMedia | object | The preview media assets for the template. Includes video, image and thumbnail |
| inputConfig | object | An object containing a list of scene objects as well as the audio placeholder param. **_The order of the scenes list directly corresponds with the scene number, which important to keep in tact_**|

**Example template object json**

```json
{  
   "colorInputs":2,
   "mediaInputs":1,
   "name":"Supernova Logo Reveal",
   "seconds":15,
   "textInputs":0,
   "id":"-KGOE9QkmBfga6EYUQaL",
   "previewMedia":{  
      "video":"https://dpteq7m4zmhsm.cloudfront.net/-KGOE9QkmBfga6EYUQaL/preview_media/preview_video.mp4",
      "image":"https://dpteq7m4zmhsm.cloudfront.net/-KGOE9QkmBfga6EYUQaL/preview_media/preview_image.jpg",
      "thumbnail":"https://dpteq7m4zmhsm.cloudfront.net/-KGOE9QkmBfga6EYUQaL/preview_media/preview_thumb.png"
   },
   "inputConfig":{  
      "scenes":[  
         {  
            "color":[  
               {  
                  "r":40,
                  "g":109,
                  "b":73,
                  "label":"Starburst"
               },
               {  
                  "r":23,
                  "g":52,
                  "b":65,
                  "label":"Background"
               }
            ],
            "media":[  
               ""
            ],
            "text":[  

            ]
         }
      ],
      "audio":""
   }
}
```

### Scene Object

A scene object contains the following fields.

| Attribute | Type | Description |
| --- | --- | --- |
| media | list | A list of empty strings to be customized with media file urls to be sent via the create video endpoint. **The order of the media list directly corresponds to the number of the placeholder. So media[0] is the equivalent to media placeholder 1** |
| text | list | A list of empty strings to be customized with text to be sent via the create video endpoint. **The order of the text list directly corresponds to the number of the placeholder. So text[0] is the equivalent to text placeholder 1** |
| color | list | A list of RGB color objects to be customized with color and sent via the create video endpoint. Note that default colors are already pre-filled. **The order of the color list directly corresponds to the number of the placeholder. So color[0] is the equivalent to color placeholder 1** |

The scenes object along with the sound field should be customized and sent to the create video endpoint. Here


### Video Status Object
A video status object contains the following fields.

| Attribute | Type | Description |
| --- | --- | --- |
| status | string | The label of the status. `staging`, `build`, `render`, `compile`, `processing`, `done` |
| progress | int | The percent of video job progress done from 0-100 |
| downloadUrl | string | Temporary download url for finished video file, expires in 30 seconds. *_Only available if the status is done_*. |
