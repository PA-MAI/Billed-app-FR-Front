/**
 * @jest-environment jsdom
 */
// test d'environement DOM
test("Jest utilise jsdom", () => {
    document.body.innerHTML = `<div id="test">Hello</div>`;
    const div = document.getElementById("test");
    expect(div.textContent).toBe("Hello");
  });