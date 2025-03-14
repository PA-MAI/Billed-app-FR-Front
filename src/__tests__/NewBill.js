/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import {
  screen,
  fireEvent,
  waitFor
} from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import {
  ROUTES_PATH
} from "../constants/routes.js";
import {
  localStorageMock
} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js";
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore);

beforeAll(() => {
  jest.spyOn(mockStore, "bills");
  document.body.innerHTML = "";
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.tld",
      status: "connected",
    })
  );

  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});
// Réinitialise localStorage après chaque test
afterEach(() => {
  document.body.innerHTML = "";
  jest.clearAllMocks();

});


// Test d'intégration GET
// Vérifie si le formulaire de nouvelle note de frais s'affiche bien
describe("Given I am connected as an employee and I am on NewBill Page Test Suite", () => {

  //Teste que updateBill 
  describe("When submitting a new bill", () => {
    test("Then updateBill should be called with the correct input for bill data ", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      // Mock de updateBill
      newBill.updateBill = jest.fn();

      // Données simulées pour la nouvelle note de frais
      const mockBillData = {
        type: "Transports",
        name: "Taxi",
        date: "2024-03-09",
        amount: "50",
        vat: "10",
        pct: "20",
        commentary: "Déplacement professionnel",
        fileUrl: "https://mock.url/facture.jpg",
        fileName: "facture.jpg"
      };

      // Remplit les inputs du formulaire avec les valeurs simulées
      screen.getByTestId("expense-type").value = mockBillData.type;
      screen.getByTestId("expense-name").value = mockBillData.name;
      screen.getByTestId("datepicker").value = mockBillData.date;
      screen.getByTestId("amount").value = mockBillData.amount;
      screen.getByTestId("vat").value = mockBillData.vat;
      screen.getByTestId("pct").value = mockBillData.pct;
      screen.getByTestId("commentary").value = mockBillData.commentary;
      newBill.fileUrl = mockBillData.fileUrl;
      newBill.fileName = mockBillData.fileName;

      // Vérifie si les valeurs sont bien mises dans le DOM
      expect(screen.getByTestId("expense-type").value).toBe(mockBillData.type);
      expect(screen.getByTestId("expense-name").value).toBe(mockBillData.name);
      expect(screen.getByTestId("datepicker").value).toBe(mockBillData.date);
      expect(screen.getByTestId("amount").value).toBe(mockBillData.amount);
      expect(screen.getByTestId("vat").value).toBe(mockBillData.vat);
      expect(screen.getByTestId("pct").value).toBe(mockBillData.pct);
      expect(screen.getByTestId("commentary").value).toBe(mockBillData.commentary);

      // Récupération du formulaire et simulation de la soumission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Vérifie que updateBill a bien été appelé
      expect(newBill.updateBill).toHaveBeenCalled();
    });
  });
  //Teste le catch du fichier NewBill.js en simulant une erreur sur update().
  describe("When an error occurs during bill submission due to an API failure", () => {
    test("Then it should catch the error and log it to the console", async () => {
      console.error = jest.fn(); // Mock console.error
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: {
          bills: () => ({
            update: jest.fn().mockRejectedValue(new Error("Erreur"))
          })
        },
        localStorage: window.localStorage
      });
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      await waitFor(() => expect(console.error).toHaveBeenCalled());
    });
  });
  //test que onNavigate(ROUTES_PATH['Bills']) est bien appelé après une soumission réussie.
  describe("When form submission is successful", () => {
    test("Then it should navigate to Bills page with ROUTES_PATH['Bills']", async () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      await waitFor(() => expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']));
    });
  });

  //simule l'affichage de la page newBill 
  describe("When I am on NewBill page", () => {
    test("Then, the form should be displayed", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  // Vérifie si l'utilisateur peut uploader un fichier avec une extension correcte
  describe("When uploading a file with a valid extension (jpg, jpeg, png)", () => {
    test("Then the file should be uploaded without triggering an error alert", async () => {
      window.alert = jest.fn();
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });
      const inputFile = screen.getByTestId("file");
      const file = new File(["fileJpg"], "test.jpg", {
        type: "image/jpeg"
      });
      fireEvent.change(inputFile, {
        target: {
          files: [file]
        }
      });
      await waitFor(() => expect(window.alert).not.toHaveBeenCalled());
    });
  });

  // Vérifie si l'utilisateur est empêché d'uploader un fichier avec une mauvaise extension
  describe("When I upload a file with a bad extension", () => {
    test("Then, it should display an error message and reset the input field", async () => {
      window.alert = jest.fn();
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });
      const inputFile = screen.getByTestId("file");
      const file = new File(["filePdf"], "test.pdf", {
        type: "application/pdf"
      });
      fireEvent.change(inputFile, {
        target: {
          files: [file]
        }
      });
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Seuls les fichiers JPG, JPEG et PNG sont autorisés.");
        expect(inputFile.value).toBe("");
      });
    });
  });
});