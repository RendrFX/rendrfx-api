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

## Templates
The templates resource allows you to get information about the templates that are available to your account. Templates can be viewed individually or as a list.
