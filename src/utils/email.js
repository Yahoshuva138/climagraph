// This file is for sending emails from the frontend using EmailJS
// You need to sign up at https://www.emailjs.com/ and get your service ID, template ID, and public key
// Never expose your private key in frontend code
import emailjs from '@emailjs/browser';

export const sendContactEmail = async (formData) => {
  // Replace these with your actual EmailJS service/template/public key
  const SERVICE_ID = 'service_epiyxvw';
  const TEMPLATE_ID = 'template_k4h48xg';
  const PUBLIC_KEY = '_oNb1898SjS6iMNi_';

  const templateParams = {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message,
    to_email: 'saimanoj1246@gmail.com',
  };
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
};
