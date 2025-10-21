describe("Jest Setup Test", () => {
  it("should run basic tests", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have access to jest functions", () => {
    const mockFn = jest.fn();
    mockFn("test");
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  it("should have access to testing library matchers", () => {
    const element = document.createElement("div");
    element.textContent = "Hello World";
    expect(element).toBeInTheDocument();
  });
});
