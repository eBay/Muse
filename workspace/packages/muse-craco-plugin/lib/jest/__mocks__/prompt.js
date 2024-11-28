Object.defineProperty(window, 'prompt', {
    writable: true,
    value: jest.fn().mockImplementation((message, text) => {}),    
});