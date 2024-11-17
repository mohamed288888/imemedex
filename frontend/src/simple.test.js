// src/simple.test.js
test('simple test', () => {
    document.body.innerHTML = '<div>Hello Jest!</div>';
    expect(document.body.innerHTML).toBe('<div>Hello Jest!</div>');
  });
  