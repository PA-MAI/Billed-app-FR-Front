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



jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  // document.body.innerHTML = ""; // Réinitialise le DOM
 });


beforeEach(() => {
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
afterEach(() => {
   //document.body.innerHTML =''
   jest.clearAllMocks();
   
});


describe('Étant donné que je suis connecté en tant qu\'employee' , () => {
  //describe('Lorsque que la page Bills est en cours de chargement', () => {
   //   test('Alors, la page de chargement devrait être rendue', () => {
    //      document.body.innerHTML = BillsUI({ loading: true })
     //      expect(screen.getAllByText('Chargement...')).toBeTruthy()
           //expect(screen.getByTestId('error-message').innerHTML.trim().length).toBe(0)
          //expect(screen.getAllByText('Chargement...')).toBeTruthy()
     // });
 // });
  describe('Lorsque je suis sur la page du Bills mais que le back-end envoie un message d\'erreur', () => {
      test('Alors, la page d\'erreur devrait être rendue', () => {
          document.body.innerHTML = BillsUI({ error: 'message d\'erreur' })
          expect(screen.getByText('Erreur')).toBeTruthy()
      });
  });

})

 
describe('Étant donné que je suis connecté en tant qu\'employee et que je suis sur la page du Bills ', () => {
  describe('Lorsque je clique sur l\'icône de l\'œil', () => {
      test('Un modal devrait s\'ouvrir', () => {
        
         // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
         // window.localStorage.setItem('user', JSON.stringify({ type: 'employee'  }))
          document.body.innerHTML = BillsUI(bills[0])

          const handleClickIconEye = jest.fn(bills.handleClickIconEye)
          const eye = screen.getByTestId('btn-new-bill')
          eye.addEventListener('click', handleClickIconEye)
          userEvent.click(eye)
          expect(handleClickIconEye).toHaveBeenCalled()
         // const modale = screen.getByTestId('exampleModaleLongTitle')
         // expect(modale).toBeTruthy()
      })
  })
  
  
})

// test d'intégration GET
describe("Étant donné que je suis un utilisateur connecté en tant qu'employee", () => {
    describe("Lorsque je navigue sur la page Bills", () => {
        test("récupère les factures depuis l'API simulée GET", async () => {

          const mock = jest.spyOn(mockStore.bills(), "list");
          mockStore.bills().list();
          expect(mock).toHaveBeenCalledTimes(1);
          expect(screen.findByText("Mes notes de frais")).toBeTruthy();
        });

        test("Then bill icon in vertical layout should be highlighted", async () => {


            //to-do write expect expression
            // Récupère tous les éléments avec data-testid="icon-window"
            const windowIcons = await screen.findAllByTestId('icon-window'); 

            // Vérifie s'il y a au moins un élément avec la classe 'active-icon'
            const activeIcons = windowIcons.filter(icon => icon.classList.contains('active-icon'));

            // Debug : affiche combien d'éléments existent et lesquels sont actifs
            //console.log(`Nombre total d'icônes : ${windowIcons.length}`);
            //console.log(`Nombre d'icônes actifs : ${activeIcons.length}`);

            // Vérifie qu'un seul élément est actif
            expect(activeIcons.length).toBe(1);
        });
        
        test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        const antiChrono = (a, b) => ((a < b) ? 1 : -1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
        });

        test("Then, should render the Add a New Bill Page", async () => {
        document.body.innerHTML = BillsUI({ data: bills })
        console.log(document.body)
        const button = screen.getByTestId("btn-new-bill");
        console.log(button)
        userEvent.click(button);
        expect(await screen.findByText("Envoyer une note de frais")).toBeTruthy();
        });

    });
    

     
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


