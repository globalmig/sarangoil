import React from "react";

export default function GoogleMap() {
  return (
    <>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3174.437313458122!2d126.98804017642087!3d37.284768140234185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b42d0a3ddbeaf%3A0xde90dde9e3dbfd87!2z7JWE7Yq47ZSE65287J6Q!5e0!3m2!1sko!2skr!4v1757386362629!5m2!1sko!2skr"
        width="1440"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </>
  );
}
