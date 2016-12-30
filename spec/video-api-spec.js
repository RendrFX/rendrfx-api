import test from 'tape';
import superagent from 'superagent';
import crypto from 'crypto';

//Pass the following args to the process
const {
    APP_ID,
    API_SECRET_KEY,
    API_HOST = 'https://api.rendrfx.com/',
    VIDEO_JOB_ID = 'test'
} = process.env;

function generateAuthInfo(appId, apiSecretKey, manualDateInMilliseconds) {
    // Generate HMAC
    const unixTimeInMilliseconds = manualDateInMilliseconds || Date.now();
    const hmac = crypto.createHmac('sha256', apiSecretKey + unixTimeInMilliseconds);
    hmac.update(appId);
    const token = hmac.digest('hex');

    return {
        TOKEN: token,
        TIMESTAMP: unixTimeInMilliseconds
    };
}

doTryExitProcess();
console.log('==========================Starting RendrFX REST API Tests==========================');

const templatesExpectedData = [{
    colorInputs: 2,
    mediaInputs: 1,
    name: 'Supernova Logo Reveal',
    seconds: 15,
    textInputs: 0,
    id: '-KGOE9QkmBfga6EYUQaL',
    previewMedia: {
        video: 'https://dpteq7m4zmhsm.cloudfront.net/-KGOE9QkmBfga6EYUQaL/preview_media/preview_video.mp4',
        image: 'https://dpteq7m4zmhsm.cloudfront.net/-KGOE9QkmBfga6EYUQaL/preview_media/preview_image.jpg',
        thumbnail: 'https://dpteq7m4zmhsm.cloudfront.net/-KGOE9QkmBfga6EYUQaL/preview_media/preview_thumb.png'
    },
    inputConfig: {
        scenes: [{
            color: [{
                r: 40,
                g: 109,
                b: 73,
                label: 'Starburst'
            }, {
                r: 23,
                g: 52,
                b: 65,
                label: 'Background'
            }],
            media: [''],
            text: []
        }],
        audio: ''
    }
},
{
    id: '-KR_Tor-2oEhEh8vJpAO',
    name: 'Motion Glam Logo Reveal',
    previewMedia: {
        video: 'https://dpteq7m4zmhsm.cloudfront.net/-KR_Tor-2oEhEh8vJpAO/preview_media/preview_video.mp4',
        image: 'https://dpteq7m4zmhsm.cloudfront.net/-KR_Tor-2oEhEh8vJpAO/preview_media/preview_image.jpg',
        thumbnail: 'https://dpteq7m4zmhsm.cloudfront.net/-KR_Tor-2oEhEh8vJpAO/preview_media/preview_thumb.png'
    },
    inputConfig: {
        scenes: [{
            media: [''],
            text: [''],
            color: ['', '']
        }],
        audio: ''
    }
}];

test('List available templates', (t) => {

    t.plan(28);
    const templatesEndpoint = API_HOST + 'v1/templates';
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);

    const templateId = '-KGOE9QkmBfga6EYUQaL';
    const expectedTemplate = templatesExpectedData.find(_t => _t.id === templateId);

    superagent.get(templatesEndpoint)
    .query({token: TOKEN, timestamp: TIMESTAMP})
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function (err, res){

        if (err) {
            console.log('Err in list templates success test: ', err);
            t.fail(res.body.message);
        }
        const templates = res.body ? res.body : (res || {});
        const template = templates.find(_t => _t.id === templateId);
        t.equal(templates.length > 0, true, 'Should return an array of template objects');

        testExpectedTemplate(t, template, expectedTemplate);

    });

    doBadRequestTests(t, 'GET', templatesEndpoint, {token: TOKEN, timestamp: TIMESTAMP});

});

test('Get template info', (t) => {

    t.plan(27);

    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);

    const templateId = '-KGOE9QkmBfga6EYUQaL';
    const templateEndpoint = API_HOST + 'v1/templates/' + templateId;
    const expectedTemplate = templatesExpectedData.find(_t => _t.id === templateId);

    superagent.get(templateEndpoint)
    .query({token: TOKEN, timestamp: TIMESTAMP})
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function (err, res){

        if (err) {
            console.log('Err in get template info success test: ', err);
            t.fail(res.body.message);
        }

        const template = res.body ? res.body : (res || {});
        testExpectedTemplate(t, template, expectedTemplate);
    });

    doBadRequestTests(t, 'GET', templateEndpoint, {token: TOKEN, timestamp: TIMESTAMP});
});

// // TODO: Activate this test
// test('Create video', (t) => {
//
//     t.plan(9);
//     const createVideoEndpoint = API_HOST + 'v1/videos/create/';
//     const templateId = '-KR_Tor-2oEhEh8vJpAO';
//     const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);
//
//     const videoInputData = {
//         scenes: [{
//             media: ['https://s3.amazonaws.com/re.bucket/images/re.logo.square.png'],
//             text: ['www.hotdog.com'],
//             color: ['#84C53D']
//         }],
//         audio: '',
//         token: TOKEN,
//         timestamp: TIMESTAMP
//     };
//
//     superagent.post(`${createVideoEndpoint}${templateId}`)
//     .send(videoInputData)
//     .set('X-API-Appid', APP_ID)
//     .set('X-API-Key', API_SECRET_KEY)
//     .set('Accept', 'application/json')
//     .end(function (err, res){
//
//         if (err) {
//             console.log('Err in create video success test: ', err);
//             t.fail(res.body.message);
//         }
//
//         const body = res.body ? res.body : (res || {});
//         t.equal(typeof body.jobId === 'string' && body.jobId.length > 0, true, 'Create video Video Job Id exists and is a string');
//     });
//
//     doBadRequestTests(t, 'POST', `${createVideoEndpoint}${templateId}`, videoInputData);
//
// });


/*
 * Video progress process
 *
 *  D: determinate
 *  I: indeterminate
 *  number: progress step
 *
 * --Status order for Templates:
 *          I         I        D          D           I
 *      |staging|  |build|  |render|  |compile|  |processing|
 *      |   1   |  |  2  |  |  3   |  |   4   |  |    5     |
 *
 */

test('Get video status', (t) => {

    t.plan(10);
    const videoStatusEndpoint = API_HOST + 'v1/videos/status/' + VIDEO_JOB_ID;
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);
    const possibleProgress = {
        staging: {
            type: 'indeterminate',
            status: 'staging',
            val: 0
        },
        build: {
            type: 'indeterminate',
            status: 'build',
            val: 9
        },
        render: {
            type: 'determinate',
            status: 'render',
            min: 10,
            max: 49
        },
        compile: {
            type: 'determinate',
            status: 'compile',
            min: 50,
            max: 89
        },
        processing: {
            type: 'indeterminate',
            status: 'processing',
            val: 90
        },
        done: {
            type: 'indeterminate',
            status: 'done',
            val: 100
        }
    };

    superagent.get(videoStatusEndpoint)
    .query({token: TOKEN, timestamp: TIMESTAMP})
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function (err, res){

        if (err) {
            console.log('Err in get video status test: ', err);
            t.fail(res.body.message);
        }

        const videoStatus = res.body ? res.body : (res || {});
        t.equal(videoStatus.status, possibleProgress[videoStatus.status].status, 'Video status should be the same: ' + possibleProgress[videoStatus.status].status);

        if (videoStatus.status === possibleProgress.staging.status) {

            t.equal(videoStatus.progress, possibleProgress[videoStatus.status].val, 'Should be 0 percent progress if staging');
        } else if (videoStatus.status === possibleProgress.build.status) {

            t.equal(videoStatus.progress, possibleProgress[videoStatus.status].val, 'Should be 9 percent progress if build');
        } else if (videoStatus.status === possibleProgress.render.status) {

            t.equal(
                (videoStatus.progress >= possibleProgress[videoStatus.status].min && videoStatus.progress <= possibleProgress[videoStatus.status].max),
                true,
                'Should be between 10-49 percent progress if render'
            );
        } else if (videoStatus.status === possibleProgress.compile.status) {

            t.equal(
                (videoStatus.progress >= possibleProgress[videoStatus.status].min && videoStatus.progress <= possibleProgress[videoStatus.status].max),
                true,
                'Should be between 50-89 percent progress if compile'
            );
        } else if (videoStatus.status === possibleProgress.processing.status) {

            t.equal(videoStatus.progress, possibleProgress[videoStatus.status].val, 'Should be 91 percent progress if processing');
        } else if (videoStatus.status === possibleProgress.done.status) {

            t.equal(videoStatus.progress, possibleProgress[videoStatus.status].val, 'Should be 100 percent progress if done');
            t.equal(videoStatus.downloadUrl.length > 0, true, 'Should have downloadUrl');
            // TODO: download the file and run file stat against to make sure file exists
        }
    });

    doBadRequestTests(t, 'GET', videoStatusEndpoint, {token: TOKEN, timestamp: TIMESTAMP});

});

// TODO: activate this test
// test('Test video is done webhook', (t) => {
//     t.plan(1);
//
//     // TODO: Add test to get video job
// });

function testExpectedTemplate(t, template, expectedTemplate) {
    //20 tests
    t.equal(template.id, expectedTemplate.id, 'Should have expected template id');
    t.equal(template.name, expectedTemplate.name, 'Should have expected template name');
    t.equal(template.seconds, expectedTemplate.seconds, 'Should have expected template seconds');
    t.equal(template.mediaInputs, expectedTemplate.mediaInputs, 'Should have expected template mediaInputs');
    t.equal(template.textInputs, expectedTemplate.textInputs, 'Should have expected template textInputs');
    t.equal(template.colorInputs, expectedTemplate.colorInputs, 'Should have expected template colorInputs');
    t.equal(template.previewMedia.video, expectedTemplate.previewMedia.video, 'Should have expected template preview media video');
    t.equal(template.previewMedia.image, expectedTemplate.previewMedia.image, 'Should have expected template preview media image');
    t.equal(template.previewMedia.thumbnail, expectedTemplate.previewMedia.thumbnail, 'Should have expected template preview media thumbnail');

    const scenes = template.inputConfig.scenes;
    const expectedScenes = expectedTemplate.inputConfig.scenes;
    const color = scenes[0].color;
    const expectedColor = expectedScenes[0].color;
    const media = scenes[0].media;
    const expectedMedia = expectedScenes[0].media;
    const text = scenes[0].text;
    const expectedText = expectedScenes[0].text;

    t.equal(scenes.length, expectedScenes.length, 'Should have expected template scenes length');
    t.equal(color.length, expectedColor.length, 'Should have expected template scene color length');
    t.equal(color[0].r, expectedColor[0].r, 'Should have expected scene color red value');
    t.equal(color[0].g, expectedColor[0].g, 'Should have expected scene color green value');
    t.equal(color[0].b, expectedColor[0].b, 'Should have expected scene color blue value');
    t.equal(color[0].label, expectedColor[0].label, 'Should have expected scene color label');
    t.equal(media.length, expectedMedia.length, 'Should have expected template scene media length');
    t.equal(media[0], '', 'Should have expected template scene media empty string');
    t.equal(text.length, expectedText.length, 'Should have expected template scene text length');
    //t.equal(text[0], '', 'Should have expected template scene text empty string');
    t.equal(template.inputConfig.audio, '', 'Should have empty string for audio placeholder');
}

const methodMap = {
    POST: ['post', 'send'],
    GET: ['get', 'query']
};

function doBadRequestTests(t, method, endpoint, data) {
    // 8 tests

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](data)
    .set('X-API-Appid', 'bad_app_id')
    .set('Accept', 'application/json')
    .end(function (err, res){

        t.equal(err.status, 403, 'Should be a 403 given a bad app id');
        t.equal(res.body.message, 'Invalid APP ID', 'Should have "Invalid APP ID" message');
    });

    // superagent[methodMap[method][0]](endpoint)
    // [methodMap[method][1]](data)
    // .set('X-API-Appid', APP_ID)
    // .set('X-API-Key', 'bad_secret_key')
    // .set('Accept', 'application/json')
    // .end(function (err, res){
    //
    //     t.equal(err.status, 403, 'Should be a 403 given a bad app secret key');
    //     t.equal(res.body.message, 'Invalid API KEY', 'Should have "Invalid API KEY" message');
    // });

    const dataBadToken = Object.assign({}, data, {token: 'not a good token'});

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](dataBadToken)
    .set('X-API-Appid', APP_ID)
    .set('Accept', 'application/json')
    .end(function (err, res){

        t.equal(err.status, 406, 'Should be a 406 given a bad token');
        t.equal(res.body.message, 'Invalid token', 'Should have "Invalid token" message');
    });

    const expiredDate = new Date();
    expiredDate.setTime(expiredDate.getTime() - (3 * 60 * 60 * 1000)); //set three hours behind
    const badAuthData = generateAuthInfo(APP_ID, API_SECRET_KEY, expiredDate.getTime());
    const dataTokenExpired = Object.assign({}, data, {token: badAuthData.TOKEN, timestamp: badAuthData.TIMESTAMP});

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](dataTokenExpired)
    .set('X-API-Appid', APP_ID)
    .set('Accept', 'application/json')
    .end(function (err, res){

        t.equal(err.status, 406, 'Should be a 406 given a expired token');
        t.equal(res.body.message, 'Token has expired', 'Should have "Token has expired" message');
    });

    const futureDate = new Date();
    futureDate.setTime(futureDate.getTime() + (4 * 60 * 1000)); //set four minutes ahead
    const futureAuthData = generateAuthInfo(APP_ID, API_SECRET_KEY, futureDate.getTime());
    const futureTokenData = Object.assign({}, data, {token: futureAuthData.TOKEN, timestamp: futureAuthData.TIMESTAMP});

    superagent[methodMap[method][0]](endpoint)
    [methodMap[method][1]](futureTokenData)
    .set('X-API-Appid', APP_ID)
    .set('Accept', 'application/json')
    .end(function (err, res){

        t.equal(err.status, 406, 'Should be a 406 given a token from the future');
        t.equal(res.body.message, 'Timestamp is invalid', 'Should have "Timestamp is invalid" message given a future token');
    });
}

function doTryExitProcess() {
    if (!APP_ID) {
        console.log('Please define a valid APP_ID for process.env.APP_ID');
        process.exit(0);
    } else if (!API_SECRET_KEY) {
        console.log('Please define a valid API_SECRET_KEY for process.env.API_SECRET_KEY');
        process.exit(0);
    }
}
