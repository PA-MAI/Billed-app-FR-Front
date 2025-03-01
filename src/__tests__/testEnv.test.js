/**
 * @jest-environment jsdom
 */

test("Jest utilise jsdom", () => {
    document.body.innerHTML = `<div id="test">Hello</div>`;
    const div = document.getElementById("test");
    expect(div.textContent).toBe("Hello");
  });