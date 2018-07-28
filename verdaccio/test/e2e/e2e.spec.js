const scopedPackageMetadata = require('./partials/pkg-scoped');
const protectedPackageMetadata = require('./partials/pkg-protected');

describe('/ (Verdaccio Page)', () => {
    let page;
    // this might be increased based on the delays included in all test
    jest.setTimeout(200000);

    const clickElement = async function(selector, options = {button: 'middle', delay: 100}) {
      const button = await page.$(selector);
      await button.focus();
      await button.click(options);
    };

    const evaluateSignIn = async function() {
      const text = await page.evaluate(() => document.querySelector('header button > span').textContent);
      expect(text).toMatch('Login');
    };

    const getPackages = async function() {
      return await page.$$('.package-list-items > div');
    };

    const logIn = async function() {
      await clickElement('header button');
      await page.waitFor(500);
      // we fill the sign in form
      const signInDialog = await page.$('.el-dialog');
      const userInput = await signInDialog.$('input[type=text]');
      expect(userInput).not.toBeNull();
      const passInput = await signInDialog.$('input[type=password]');
      expect(passInput).not.toBeNull();
      await userInput.type('test', {delay: 100});
      await passInput.type('test', {delay: 100});
      await passInput.dispose();
      // click on log in
      const loginButton = await page.$('.login-button');
      expect(loginButton).toBeDefined();
      await loginButton.focus();
      await loginButton.click({delay: 100});
      await page.waitFor(500);
    };

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();
      await page.goto('http://0.0.0.0:55558');
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    });

    afterAll(async () => {
      await page.close()
    });

    it('should load without error', async () => {
      let text = await page.evaluate(() => document.body.textContent);

      expect(text).toContain('adduser');
    })

    it('should match npm adduser and set registry on header', async () => {
      let text = await page.evaluate(() => document.querySelector('figure').textContent);
      expect(text).toMatch('npm set registry http://0.0.0.0:55558');
      expect(text).toMatch('npm adduser --registry http://0.0.0.0:55558');
    })


    it('should match title with no packages published', async () => {
      let text = await page.evaluate(() => document.querySelector('.container h1').textContent);
      expect(text).toMatch('No Package Published Yet');
    })

    it('should match title with first step', async () => {
      let text = await page.evaluate(() => document.querySelector('#adduser code').textContent);
      expect(text).toMatch('npm adduser --registry  http://0.0.0.0:55558');
    })

    it('should match title with second step', async () => {
      let text = await page.evaluate(() => document.querySelector('#publish code').textContent);
      expect(text).toMatch('npm publish --registry http://0.0.0.0:55558');
    })

    it('should match button Login to sign in', async () => {
      await evaluateSignIn();
    })

    it('should click on sign in button', async () => {
      const signInButton = await page.$('header button');
      await signInButton.click();
      const signInDialog = await page.$('header .el-dialog__wrapper');

      expect(signInDialog).not.toBeNull();
    })

    it('should log in an user', async () => {
      // we open the dialog
      await logIn();
      // check whether user is logged
      const greetings = await page.evaluate(() => document.querySelector('.user-logged-greetings').textContent);
      const buttonLogout = await page.$('.header-button-logout');
      expect(greetings).toMatch('Hi, Test');
      expect(buttonLogout).toBeDefined();
    });

  it('should logout an user', async () => {
    // we asume the user is logged already
    await clickElement('.header-button-logout', {clickCount: 1, delay: 200});
    await page.waitFor(1000);
    await evaluateSignIn();
  })

  it('should publish a package', async () => {
    await global.__SERVER__.putPackage(scopedPackageMetadata.name, scopedPackageMetadata);
    await page.waitFor(1000);
    await page.reload();
    await page.waitFor(1000);
    const packagesList = await getPackages();

    expect(packagesList).toHaveLength(1);
  });

  it('should navigate to the package detail', async () => {
    const packagesList = await getPackages();
    const packageItem = packagesList[0];
    await packageItem.focus();
    await packageItem.click({clickCount: 1, delay: 200});
    await page.waitFor(1000);
    const readmeText = await page.evaluate(() => document.querySelector('.markdown-body').textContent);

    expect(readmeText).toMatch('test');
  });

  it('should contains last sync information', async () => {
    const versionList = await page.$$('.sidebar-info .last-sync-item');
    expect(versionList).toHaveLength(3);
  });

  it('should publish a protected package', async () => {
    await page.goto('http://0.0.0.0:55552');
    await page.waitFor(500);
    await global.__SERVER_PROTECTED__.putPackage(protectedPackageMetadata.name, protectedPackageMetadata);
    await page.waitFor(500);
    await page.reload();
    await page.waitFor(500);
    let text = await page.evaluate(() => document.querySelector('.container h1').textContent);
    expect(text).toMatch('No Package Published Yet');
  });

});
