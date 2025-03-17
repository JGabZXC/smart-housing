/* eslint-disable */
import axios from 'axios';

const tableBody = document.querySelector('.table-body');
const addressContainer = document.querySelector('#address-container');

export const getHouses = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/housings',
    });

    const houses = res.data.data.doc;
    console.log(houses);

    if (houses.length < 0) {
      addressContainer.innerHTML = '<h2>No houses found</h2>';
      return;
    }
    tableBody.innerHTML = '';

    houses.forEach((house) => {
      const row = document.createElement('tr');
      row.innerHTML = `
           <td>Block ${house.block} Lot ${house.lot}</td>
        <td>${house.street}</td>
        <td>${house.status[0].toUpperCase() + house.status.slice(1)}</td>
        <td class="d-flex gap-2">
          <button class="btn btn-primary" type="button">
            View
          </button>
          <button class="btn btn-warning" type="button">
            Edit
          </button>
          <button class="btn btn-danger" type="button">
            Delete
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    // <tr>
    //   <td>Block 1 Lot 5</td>
    //   <td>Maligaya</td>
    //   <td>Unoccupied</td>
    //   <td class="d-flex gap-2">
    //     <button class="btn btn-primary" type="button">
    //       View
    //     </button>
    //     <button class="btn btn-warning" type="button">
    //       Edit
    //     </button>
    //     <button class="btn btn-danger" type="button">
    //       Delete
    //     </button>
    //   </td>
    // </tr>;
  } catch (err) {
    console.error(err);
  }
};
