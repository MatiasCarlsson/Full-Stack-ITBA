// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// JSDOM no implementa window.scrollTo ni contexto WebGL para Three.js
window.scrollTo = jest.fn();

jest.mock('./components/hero/HeroSculpture3D', () => function HeroSculpture3DMock() {
  return <div data-testid="hero-sculpture-3d-mock" aria-hidden="true" />;
});
