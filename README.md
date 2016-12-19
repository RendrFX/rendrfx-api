# RendrFX REST API documentaiton


## RendrFX API Summary
The API is organized around the following resources -

| API Area | Resource | Description |
| --- | --- | --- |
| Templates | https://api.rendrfx.com/v1/templates | This endpoint will list the available templates for client.|
| Templates | https://api.rendrfx.com/v1/templates/:template_id | This endpoint will display information about the template, such as available inputs and media preview file urls.|


**https://api.rendrfx.com/v1/videos/create/:template_id**

Description: This endpoint will allow for a video job to be created via client

**https://api.rendrfx.com/v1/videos/status/:job_id**

Description: This endpoint will allow for client to access status of the video job.

Job Completed Payload Delivery
Payload will be delivered via server to server webhook.
