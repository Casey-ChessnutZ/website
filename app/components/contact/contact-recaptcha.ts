export type RecaptchaClient = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

export function getContactRecaptchaToken(recaptcha: RecaptchaClient, siteKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    recaptcha.ready(() => {
      recaptcha.execute(siteKey, { action: 'contact_submit' }).then(resolve, reject);
    });
  });
}
