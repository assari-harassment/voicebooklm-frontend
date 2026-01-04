module.exports = {
  File: class File {
    constructor(path) {
      this.path = path;
      this.exists = true;
    }
  },
  FileSystem: {
    documentDirectory: '/path/to/documents/',
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
  },
};
