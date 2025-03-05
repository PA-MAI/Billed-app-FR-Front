/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { ROUTES,ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import BillsUI from "../views/BillsUI.js"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";


jest.mock("../app/store", () => mockStore)


beforeEach(() => {

    jest.clearAllMocks();

    document.body.innerHTML = ""; // Réinitialise le DOM
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
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



describe('Étant donné que je suis connecté en tant qu\'employee' , () => {
   describe('Lorsque je suis sur la page du Bills mais que le back-end envoie un message d\'erreur', () => {
      test('Alors, la page d\'erreur devrait être rendue', () => {
          document.body.innerHTML = BillsUI({ error: 'message d\'erreur' })
          expect(screen.getByText('Erreur')).toBeTruthy()
      });
  });

})

 // simule l'ouverture de la modale est bien appelée
describe('Étant donné que je suis connecté en tant qu\'employee et que je suis sur la page du Bills ', () => {
    describe('Lorsque je clique sur le bouton Nouvelle note de frais', () => {

        test('Une modale devrait s\'ouvrir', () => {
        document.body.innerHTML = BillsUI(bills[0])
        const handleClickNewBill = jest.fn(bills.handleClickNewBill)
        const button = screen.getByTestId("btn-new-bill")
        button.addEventListener('click', handleClickNewBill)
        userEvent.click(button)
        expect(handleClickNewBill).toHaveBeenCalled()

      })
    })
    describe('Lorsque je clique sur l\'icône de l\'œil', () => {
        test('Une modale devrait s\'ouvrir', () => {

        document.body.innerHTML = BillsUI(bills[0])
        const handleClickIconEye = jest.fn(bills.handleClickIconEye)
        const eye = screen.getByTestId("icon-eye")
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
       
    })
  })
})

// test d'intégration GET

describe("Étant donné que je suis un utilisateur connecté en tant qu'employee", () => {
    describe("Lorsque je navigue sur la page Bills", () => {
        //vérifie que les factures sont bien récupérées
        test("récupère les factures depuis l'API simulée GET", async () => {
            const mock = jest.spyOn(mockStore.bills(), "list");
            mockStore.bills().list();
            expect(mock).toHaveBeenCalledTimes(1);
            expect(screen.findByText("Mes notes de frais")).toBeTruthy();
        });
        //vérifie que la couleur de icon-window est bien éclairé
        test("Then bill icon in vertical layout should be highlighted", async () => {

            const windowIcons = await screen.findAllByTestId('icon-window'); 
            const activeIcons = windowIcons.filter(icon => icon.classList.contains('active-icon'));
            expect(activeIcons.length).toBe(1);
        });
        // verifie que les dates sont bien dans l'ordre antichrono
        test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        const antiChrono = (a, b) => ((a < b) ? 1 : -1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
        });
    });
    //teste le bon affichage de newBill page
    describe("Lorsque je click sur le boutton Nouvelle note de frais", () => {
        test("Then, should render the Add a New Bill Page", async () => {
            const onNavigate = jest.fn((pathname) => {
                document.body.innerHTML = ROUTES({ pathname }); // Simule la navigation
            });
            document.body.innerHTML = BillsUI({ data: bills });
            const button = screen.getByTestId("btn-new-bill");
            // Simule l'instance de NewBill pour attacher l'événement click
            new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
            userEvent.click(button);
            await waitFor(() => {
                expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
            });
        });
    });

    //simule des d'erreurs d'API
    describe("Lorsque qu'une erreur survient sur l'API", () => {
        test("récupère les factures depuis une API et échoue avec une erreur 404", async () => {
              mockStore.bills.mockImplementationOnce(() => {
                  return {
                      list : () =>  {
                          return Promise.reject(new Error("Erreur 404"))
                      }
                  }})
              window.onNavigate(ROUTES_PATH.Bills)
              await new Promise(process.nextTick);
              const message = await screen.getByText(/Erreur 404/)
              expect(message).toBeTruthy()
        });

        test("récupère les messages depuis une API et échoue avec une erreur 500", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                  return {
                      list : () =>  {
                          return Promise.reject(new Error("Erreur 500"))
                      }
            }});
              window.onNavigate(ROUTES_PATH.Bills)
              await new Promise(process.nextTick);
              const message = await screen.getByText(/Erreur 500/)
              expect(message).toBeTruthy()
        });
    });

});


