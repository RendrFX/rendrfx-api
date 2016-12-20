import test from 'tape'
import superagent from 'superagent'
import crypto from 'crypto'

//Pass the following args to the process
const {
    NODE_ENV,
    APP_ID,
    API_SECRET_KEY,
    API_HOST = "https://api.rendrfx.com"
} = process.env.NODE_ENV;

function generateAuthInfo(appId, apiSecretKey, manualDateInMilliseconds) {
    // Generate HMAC
    const unixTimeInMilliseconds = manualDateInMilliseconds || Date.now();
    const hmac = crypto.createHmac('sha256', apiSecretKey + unixTimeInMilliseconds);
    hmac.update(appId);
    const token = hmac.digest('hex');

    return {
        TOKEN: token,
        TIMESTAMP: unixTimeInMilliseconds
    }
}

doTryExitProcess();

test('List available templates', (t) => {

    t.plan(1)
    const templatesEndpoint = API_HOST + "v1/templates/"
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);
    // TODO: Add test to get all templates
});

test('Get template info', (t) => {

    t.plan(8)
    const templateId = '-KR_Tor-2oEhEh8vJpAO';
    const templateEndpoint = API_HOST + "v1/templates/" + templateId
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);

    const expectedTemplateInfo = {
        templateInfo: {
            name: 'Motion Glam Logo Reveal',
            previewMedia: {
                video: 'https://dpteq7m4zmhsm.cloudfront.net/-KR_Tor-2oEhEh8vJpAO/preview_media/preview_video.mp4',
                image: 'https://dpteq7m4zmhsm.cloudfront.net/-KR_Tor-2oEhEh8vJpAO/preview_media/preview_image.jpg',
                thumbnail: 'https://dpteq7m4zmhsm.cloudfront.net/-KR_Tor-2oEhEh8vJpAO/preview_media/preview_thumb.png'
            }
        },
        inputConfig: {
            scenes: [{
                media: [''],
                text: [''],
                color: ['', ''],
            }],
            audio: '',
        }
    }

    superagent.get(templateEndpoint)
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function(err, res){

        if (err) {
            console.log('Err in get template info success test: ', err);
            t.fail(res.body.message)
        }

        const template = res.body ? res.body.data : (res || {});
        const {templateInfo, inputConfig} = template;
        const {scenes, audio} = inputConfig
        t.equal(templateInfo.name, expectedTemplateInfo.templateInfo.name, "Should have name: " + expectedTemplateInfo.templateInfo.name)
        t.equal(templateInfo.previewMedia.video, expectedTemplateInfo.templateInfo.previewMedia.video, "Should have preview video: " + expectedTemplateInfo.templateInfo.previewMedia.video)
        t.equal(templateInfo.previewMedia.image, expectedTemplateInfo.templateInfo.previewMedia.image, "Should have preview image: " + expectedTemplateInfo.templateInfo.previewMedia.image)
        t.equal(templateInfo.previewMedia.thumbnail, expectedTemplateInfo.templateInfo.previewMedia.thumbnail, "Should have preview thumbnail: " + expectedTemplateInfo.templateInfo.previewMedia.thumbnail)
        t.equal(scenes[0].media.length, 1, "Should have 1 media placeholder")
        t.equal(scenes[0].text.length, 1, "Should have 1 text placeholder")
        t.equal(scenes[0].color.length, 2, "Should have 2 color placeholders")
        t.equal(audio,'', "Should have audio placeholder")
    });

    doBadRequestTests(t, 'GET', templateEndpoint, {})

});

test('Create video', (t) => {

    t.plan(9)
    const createVideoEndpoint = API_HOST + "v1/videos/create/"
    const templateId = '-KR_Tor-2oEhEh8vJpAO';
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);

    const videoInputData = {
        scenes: [{
            media: ['https://s3.amazonaws.com/re.bucket/images/re.logo.square.png'],
            text: ['www.hotdog.com'],
            color: ['#84C53D'],
        }]
        audio: ''
        TOKEN,
        TIMESTAMP
    };

    superagent.post(`${createVideoEndpoint}${templateId}`)
    .send(videoInputData)
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function(err, res){

        if (err) {
            console.log('Err in create video success test: ', err);
            t.fail(res.body.message)
        }

        const body = res.body ? res.body.data : (res || {});
        t.equal(typeof body.jobId === "string" && body.jobId.length > 0, true, "Create video Video Job Id exists and is a string")
    });

    doBadRequestTests(t, 'POST', `${createVideoEndpoint}${templateId}`, videoInputData)

});

test('Get video status', (t) => {
    t.plan(1)
    const videoStatusEndpoint = API_HOST + "v1/videos/status/";
    // TODO: Add test to get video job status
});

test('Test video is done webhook', (t) => {
    t.plan(1)

    // TODO: Add test to get video job
});

const methodMap = {
    POST: ['post', 'send'],
    GET: ['get', 'query'],
}

function doBadRequestTests(t, method, endpoint, data) {
    // 8 tests

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](data)
    .set('X-API-Appid', 'bad_app_id')
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function(err, res){

        t.equal(err.status, 403,"Should be a 403 given a bad app id");
        t.equal(res.body.message, "Authentication headers missing");
    });

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](data)
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', 'bad_secret_key')
    .set('Accept', 'application/json')
    .end(function(err, res){

        t.equal(err.status, 407, "Should be a 407 given a bad app secret key");
        t.equal(res.body.message, "Authentication headers missing");
    });

    const dataBadToken = Object.assign({}, data, {TOKEN: 'not a good token'})

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](data)
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function(err, res){

        t.equal(err.status, 406, "Should be a 406 given a bad token");
        t.equal(res.body.message, "Invalid token");
    });

    const expiredDate = new Date();
    expiredDate.setTime(expiredDate.getTime() - (4*60*60*1000)); //set three hours behind
    const badAuthData = generateAuthInfo(APP_ID, API_SECRET_KEY, expiredDate.getTime());
    const dataTokenExpired = Object.assign({}, data, {TOKEN: badAuthData.token});

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](data)
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function(err, res){

        t.equal(err.status, 406, "Should be a 406 given a bad token");
        t.equal(res.body.message, "Token has expired");
    });
}

function doTryExitProcess() {
    if (APP_ID === null {
        console.log('Please define a valid APP_ID for process.env.APP_ID');
        process.exit(0);
    }
    if (API_SECRET_KEY === null {
        console.log('Please define a valid API_SECRET_KEY for process.env.API_SECRET_KEY');
        process.exit(0);
    }
}
