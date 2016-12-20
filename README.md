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

```
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

# Templates
The templates resource allows you to get information about the templates that are available to your account. Templates can be viewed individually or as a list.

## List all templates
You can fetch a list of available templates.

* `https://api.rendrfx.com/v1/templates`

| Path Parameters | Query Parameters | Required | Description |
| --- | --- | --- | --- |
| | token | yes | The security token generated using HMAC SHA-256 |
| | timestamp | yes | The timestamp in milleseconds used to generate the token.|

```
    $ curl \
    -s https://api.rendrfx.com/via/templates?token=c54c41281c45bfb2d7b86b56ff89961290b406f66cec6431dccce859a4a8522f&timestamp=1482246580660 \
    -H 'X-API-Appid: yourAppId' \
    -H 'X-API-Key: yourSecretKey' \
    -H 'Accept:application/json'
```

Returns
A list of templates. The templates list contains an array of template objects.

## Get individual template
