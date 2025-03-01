const mockeStore = {
    list: jest.fn(() => Promise.resolve([
      {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://test.storage.tld/v0/b/billable-677b6/...",
        status: "pending",
        type: "Hôtel et logement",
        date: "2004-04-04",
        amount: 400,
        email: "a@a",
        pct: 20
      }
    ]))
  };
  const mockStore = {
    bills: jest.fn(() => ({
      list: jest.fn(() => Promise.resolve([])) // Simule un retour vide pour éviter les erreurs
    }))
  };
  
  export default mockStore;