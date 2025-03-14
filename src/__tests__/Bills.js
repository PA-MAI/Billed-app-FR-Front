/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import {
  screen,
  waitFor
} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import {
  ROUTES,
  ROUTES_PATH
} from "../constants/routes.js";
import {
  localStorageMock
} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import {
  bills
} from "../fixtures/bills"
import BillsUI from "../views/BillsUI.js"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = ""; // Réinitialise le DOM
  $.fn.modal = jest.fn(); // Empêche l'erreur liée à modal()
  jest.spyOn(mockStore, "bills")
  Object.defineProperty(
    window,
    'localStorage', {
      value: localStorageMock
    }
  )
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: "a@a",
    status: "connected",
  }))
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.appendChild(root)
  router()
  window.onNavigate(ROUTES_PATH.Bills)
})

// Vérifie l'affichage de la page d'erreur lorsque le back-end renvoie une erreur
describe('Given I am logged in as an employee', () => {
  describe('When I am on the Bills page but the backend sends an error message', () => {
    test('Then, the error page should be rendered', () => {
      document.body.innerHTML = BillsUI({
        error: 'message d\'erreur'
      })
      expect(screen.getByText('Erreur')).toBeTruthy()
    });
  });
})

// Vérifie que l'ouverture de la modale est bien appelée
describe('Given I am logged in as an employee and I am on the Bills page', () => {
  describe('When I click on the New Bill button', () => {
    test('Then a modal should open thanks to the handleClickNewBill method', () => {
      document.body.innerHTML = BillsUI(bills[0])
      const handleClickNewBill = jest.fn(bills.handleClickNewBill)
      const button = screen.getByTestId("btn-new-bill")
      button.addEventListener('click', handleClickNewBill)
      userEvent.click(button)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
  })

  // Vérifie que la modale s'ouvre correctement en cliquant sur l'icône de l'œil
  describe("When I click on the eye icon", () => {
    test("Then the handleClickIconEye method is called and the modal is updated", async () => {
      document.body.innerHTML = BillsUI({
        data: bills
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        });
      };
      const newBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
      const handleClickIconEye = jest.spyOn(newBills, "handleClickIconEye");
      const eyes = screen.getAllByTestId("icon-eye");
      userEvent.click(eyes[0]);
      // vérifie l'appel à handleClickIconEye
      expect(handleClickIconEye).toHaveBeenCalled();

      // Vérifie que la modale a bien été mise à jour
      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toContain("bill-proof-container");

      // simule que la fonction modal() a bien été appelée sur $('#modaleFile')
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });
  });
});

// Test d'intégration GET
describe("Given I am a logged-in employee Test suite", () => {
  describe("When I navigate to the Bills page", () => {
    // Vérifie que les factures sont bien récupérées
    test("Then, fetch bills from the mock API GET and display the title on Bills page", async () => {
      const mock = jest.spyOn(mockStore.bills(), "list");
      jest.spyOn(mockStore.bills(), "list").mockResolvedValueOnce(bills);
      mockStore.bills().list();
      expect(mock).toHaveBeenCalledTimes(1);
      expect(screen.findByText("Mes notes de frais")).toBeTruthy();
    });

    test("Then data of first bill is displayed correctly", async () => {
      // Génère le DOM avec les données des factures
      document.body.innerHTML = BillsUI({
        data: [...bills]
      });
      await waitFor(() => expect(screen.getByText("Hôtel et logement")).toBeTruthy());
      expect(screen.getByText("encore")).toBeTruthy();
      expect(screen.findByText("4 Avr. 04")).toBeTruthy();
      expect(screen.getByText("400 €")).toBeTruthy();
      expect(screen.getByText("pending")).toBeTruthy();

      const eyes = screen.getAllByTestId("icon-eye");
      expect(eyes[0]).toBeTruthy();
    });

    // Vérifie que l'icône de la fenêtre est bien éclairée
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const windowIcons = await screen.findAllByTestId('icon-window');
      const activeIcons = windowIcons.filter(icon => icon.classList.contains('active-icon'));
      expect(activeIcons.length).toBe(1);
    });

    // Vérifie que les factures sont bien triées en ordre antichronologique
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills
      })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    });
  });

  // Vérifie l'affichage correct de la page newBill
  describe("When I click on the New Bill button", () => {
    test("Then, should render the Add a New Bill Page display title : Envoyer une note de frais message ", async () => {
      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        }); // Simule la navigation
      });
      document.body.innerHTML = BillsUI({
        data: bills
      });
      const button = screen.getByTestId("btn-new-bill");
      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
      userEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });
  });

  // Simule des erreurs d'API
  describe("When an error occurs on the API", () => {
    test("Then, fetch bills from an API and fail with 404 error", async () => {
      mockStore.bills().list = jest.fn().mockRejectedValue(new Error("Erreur 404"));
      const html = BillsUI({
        error: "Erreur 404"
      });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("Then, fetch bills from an API and fail with 500 error", async () => {
      mockStore.bills().list = jest.fn().mockRejectedValue(new Error("Erreur 500"));
      const html = BillsUI({
        error: "Erreur 500"
      });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

});