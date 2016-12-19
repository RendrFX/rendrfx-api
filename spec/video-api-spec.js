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

function generateAuthInfo(appId, apiSecretKey) {
    // Generate HMAC
    const unixTimeInMilliseconds = Date.now();
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
});

test('Get template info', (t) => {

    t.plan(1)
    const templateId = '';
    const templatesEndpoint = API_HOST + "v1/templates/" + templateId
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);
});

test('Create video', (t) => {

    t.plan(2)
    const createVideoEndpoint = API_HOST + "v1/videos/create/"
    const templateId = '-KR_Tor-2oEhEh8vJpAO';
    const {TOKEN, TIMESTAMP} = generateAuthInfo(APP_ID, API_SECRET_KEY);

    const videoInputData = {
        media: 'https://s3.amazonaws.com/re.bucket/images/re.logo.square.png',
        text: 'www.hotdog.com',
        color: '#84C53D',
        audio: ''
    };

    //test success response
    superagent.get(`${createVideoEndpoint}${templateId}`)
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
        t.equal(typeof body.jobId === "string" && body.jobId.length > 0, true, "Video Job Id exists and is a string")
    });

    //Test failure response
    superagent.get(`${createVideoEndpoint}${templateId}`)
    .send(videoInputData)
    .set('X-API-Appid', APP_ID)
    .set('X-API-Key', API_SECRET_KEY)
    .set('Accept', 'application/json')
    .end(function(err, res){

        t.equal(err.status, 403, true, "Create video is 403 unauthorized")
    });
});

test('Get video status', (t) => {
    t.plan(1)
    const videoStatusEndpoint = API_HOST + "v1/videos/status/"
});

test('Test video is done webhook', (t) => {
    t.plan(1)
});

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
