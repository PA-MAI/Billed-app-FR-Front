/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/dom";
//import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js";
//import BillsUI from "../views/BillsUI.js";
import { formatDate } from "../app/format.js"
import router from "../app/Router.js";




describe('Given I am connected as an employee and i am on NewBill Page', () => {
  describe('When bill data is passed to NewBillUI', () => {
    test(('Then, it should them in the page'), () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
       const bill = {
         "id": "47qAXb6fIm2zOKkLzMro",
         "vat": "80",
         "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
         "status": "accepted",
         "type": "Hôtel et logement",
         "commentAdmin": "ok",
         "commentary": "séminaire billed",
         "name": "encore",
         "fileName": "preview-facture-free-201801-pdf-1.jpg",
         "date": "2004-04-04",
         "amount": 400,
         "email": "a@a",
         "pct": 20
       }
      
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      
      //console.log("DOM après injection :", document.body.innerHTML);
      //const newBill= new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
      //console.log("DOM de resultat:", newBill);
      expect(screen.findByText(bill.vat.value)).toBeTruthy()
      expect(screen.getByText(bill.type)).toBeTruthy()
      expect(screen.findByText(bill.commentary)).toBeTruthy()
      expect(screen.findByText(bill.name)).toBeTruthy()
      console.log("Recherche du texte :", bill.type, bill.name, bill.amount, bill.date); // Voir si un élément est trouvé
      expect(screen.findByText(bill.fileName)).toBeTruthy()
      //console.log("Date formatée :", formatDate(bill.date));
      expect(screen.findByText(formatDate(bill.date))).toBeTruthy()
      expect(screen.findByText(bill.amount.toString())).toBeTruthy()
      expect(screen.findByText(bill.pct.toString())).toBeTruthy()
    })
  })

  jest.mock("../app/store", () => mockStore);

  beforeAll(() => {
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
  
   // console.log("DOM avant router :", document.body.innerHTML);
    router();
   // console.log("DOM après router :", document.body.innerHTML);
    
    window.onNavigate(ROUTES_PATH.NewBill);
  });
  afterEach(() => {
    document.body.innerHTML = "";
     jest.clearAllMocks();
  });

  describe("When I upload a file with a correct extension", () => {
    test("Then I upload this file with a correct extension and no error message", async () => {
      // Mock de window.alert
      window.alert = jest.fn();
  
      // Simule un DOM contenant le formulaire
      document.body.innerHTML = `
        <form data-testid="form-new-bill">
          <input data-testid="file" type="file" />
        </form>
      `;
  
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
  
      const inputFile = screen.getByTestId("file");
  
      // Simule le téléchargement d'un fichier valide
      const file = new File(["fileJpg"], "test.jpg", { type: "image/jpeg" });
  
      fireEvent.change(inputFile, { target: { files: [file] } });
  
      // Vérifie que l'alerte n'a PAS été appelée (donc aucun message d'erreur)
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe("When  I upload a file with a bad extension ", () => {
    test("Then it should display the error message", async () => {
      // Mock de window.alert
      window.alert = jest.fn();
      // Simule un DOM contenant le formulaire
      document.body.innerHTML = `
        <form data-testid="form-new-bill">
          <input data-testid="file" type="file" />
        </form>
      `;
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
      
      const inputFile = screen.getByTestId("file");
      const file = new File(["filePdf"], "test.pdf", { type: "application/pdf" })
      fireEvent.change(inputFile, { target: { files: [file] } });
    
      // Vérifie que l'alerte a bien été appelée avec le bon message
      expect(window.alert).toHaveBeenCalledWith("Seuls les fichiers JPG, JPEG et PNG sont autorisés.");
      
      // Vérifie que le champ de fichier a été réinitialisé
      expect(inputFile.value).toBe(""); 
    });
  });
})

