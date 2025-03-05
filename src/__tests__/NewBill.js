/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js";
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore);

beforeAll(() => {
jest.spyOn(mockStore, "bills");
  document.body.innerHTML = "";
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
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
  
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: 'Employee',
      email:"employee@test.tld",
      status: "connected",
    })
  ); 
});



// Vérifie si le formulaire de nouvelle note de frais s'affiche bien
describe("Given I am connected as an employee and I am on NewBill Page Test Suite", () => {
  describe('When extracting email from localStorage', () => {
    
    test('Then it should retrieve the correct email', () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      const email = userData ? JSON.parse(userData).email : undefined;
      expect(email).toBe("employee@test.tld");
    });
    // Simule un utilisateur sans email
    test('Then it should handle missing email gracefully', () => {
      
      localStorage.setItem("user", JSON.stringify({})); 
      const userData = localStorage.getItem("user");
      const email = userData ? JSON.parse(userData).email : undefined;
      expect(email).toBeUndefined();
    });
    // Simule un localStorage vide
    test('Then it should handle null localStorage gracefully', () => {
      localStorage.removeItem("user"); 
      const userData = localStorage.getItem("user");
      const email = userData ? JSON.parse(userData).email : undefined;
      expect(email).toBeUndefined();
    });
  });
  //Teste que updateBill 
  describe("When submitting a new bill", () => {
    test("Then updateBill should be called with the correct bill data", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
      newBill.updateBill = jest.fn(); // Mock updateBill
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      expect(newBill.updateBill).toHaveBeenCalled();
    });
  });
  //Teste le catch du fichier NewBill.js en simulant une erreur sur update().
  describe("When an error occurs during bill submission", () => {
    test("Then it should catch the error and log it", async () => {
      console.error = jest.fn(); // Mock console.error
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store: { bills: () => ({ update: jest.fn().mockRejectedValue(new Error("Erreur")) }) }, localStorage: window.localStorage });
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);
      await waitFor(() => expect(console.error).toHaveBeenCalled());
    });
  });
  //test que onNavigate(ROUTES_PATH['Bills']) est bien appelé après une soumission réussie.
  describe("When form submission is successful", () => {
    test("Then it should navigate to Bills page", async () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
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

  // Vérifie si l'utilisateur peut téléverser un fichier avec une extension correcte
  describe("When I upload a file with a correct extension", () => {
    test("Then it should allow the upload without error", async () => {
      window.alert = jest.fn();
      const onNavigate = jest.fn();
      document.body.innerHTML = `<form data-testid="form-new-bill"><input data-testid="file" type="file" /></form>`;
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
      const inputFile = screen.getByTestId("file");
      const file = new File(["fileJpg"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(inputFile, { target: { files: [file] } });
      await waitFor(() => expect(window.alert).not.toHaveBeenCalled());
    });
  });

  // Vérifie si l'utilisateur est empêché d'uploader un fichier avec une mauvaise extension
  describe("When I upload a file with a bad extension", () => {
    test("Then, it should display an error message and reset the input field", async () => {
      window.alert = jest.fn();
      const onNavigate = jest.fn();
      document.body.innerHTML = `<form data-testid="form-new-bill"><input data-testid="file" type="file" /></form>`;
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
      const inputFile = screen.getByTestId("file");
      const file = new File(["filePdf"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(inputFile, { target: { files: [file] } });
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Seuls les fichiers JPG, JPEG et PNG sont autorisés.");
        expect(inputFile.value).toBe("");
      });
    });
  });
});