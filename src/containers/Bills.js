import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => {
          try {
            const rowDate = new Date(doc.date);
            if (isNaN(rowDate)) throw new Error("Invalid date");

            return {
              ...doc,
              rowDate: rowDate.toISOString(),  // Stocke la date en ISO pour tri
              date: formatDate(doc.date), // Affichage seulement !
              status: formatStatus(doc.status)
            };
          } catch (e) {
            console.log(e, 'for', doc);
            return {
              ...doc,
              date: doc.date, // On garde la date brute si elle est invalide
              status: formatStatus(doc.status)
            };
          }
        })
        .sort((a, b) => {
          const dateDiff = new Date(b.rowDate) - new Date(a.rowDate);

          // Si les dates sont identiques, tri par ID pour un ordre stable
          if (dateDiff === 0) {
            return b.id.localeCompare(a.id);
          }
          return dateDiff;
        });

      console.log('length', bills.length);
      return bills;
    });

       
  }
};
}
