const contactRecaptchaAction = 'contact_submit';
const minimumScore = 0.5;

type RecaptchaVerification = {
  success?: unknown;
  score?: unknown;
  action?: unknown;
};

export async function verifyContactRecaptcha(token: unknown): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || typeof token !== 'string' || !token) return false;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const verification = await response.json() as RecaptchaVerification;
    return response.ok
      && verification.success === true
      && verification.action === contactRecaptchaAction
      && typeof verification.score === 'number'
      && verification.score >= minimumScore;
  } catch {
    return false;
  }
}
