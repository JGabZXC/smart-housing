/* eslint-disable */

function renderCollections(collections) {
  this.garbageList.innerHTML = collections.map(garbage => `
      <div class="card mb-3">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0 text-slate-900 fw-bold">Phase ${garbage.phase}</h5>
          <div class="dropdown mb-2 mb-md-0">
             <button class="btn dropdown-toggle text-slate-600" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                 <i class="bi bi-gear"></i> Actions
               </button>
               <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li>
                     <button class="dropdown-item btn btn-sm add-day text-slate-600 fw-semibold" data-garbage-id="${garbage._id}">
                      Add Day
                    </button>
                   </li>
                   <li>
                     <button class="dropdown-item btn btn-sm edit-phase-number text-slate-600 fw-semibold" data-bs-toggle="modal" data-bs-target="#garbageModal" data-garbage-id="${garbage._id}">
                        Edit Phase Number
                      </button>
                   </li> 
                   <li>
                     <button class="dropdown-item btn btn-sm delete-phase-number text-slate-600 fw-semibold" data-garbage-id="${garbage._id}">
                        Delete Phase
                      </button>
                   </li>
               </ul>
           </div>
        </div>
        <div class="card-body">
          ${garbage.schedule.map(schedule => `
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0 text-slate-700 fw-bold">${schedule.day}</h6>
                <div class="d-flex align-items-center gap-2">
                  <button class="btn btn-sm add-time border border-slate-400 text-slate-400 fw-semibold" 
                    data-garbage-id="${garbage._id}"
                    data-schedule-id="${schedule._id}">
                    Add Time
                  </button>
                  <button class="btn btn-sm edit-name border border-slate-400 text-slate-400 fw-semibold" 
                    data-garbage-id="${garbage._id}"
                    data-schedule-id="${schedule._id}">
                    Edit Name
                  </button>
                </div>
              </div>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th class="collection-width text-slate-700 fw-semibold">Time</th>
                    <th class="collection-width text-slate-700 fw-semibold">Streets</th>
                    <th class="collection-width text-slate-700 fw-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${schedule.timeLocation.map(loc => `
                    <tr>
                      <td class="text-slate-600" style="vertical-align: middle">${loc.time}</td>
                      <td class="text-slate-600" style="vertical-align: middle">${loc.street.join(', ')}</td>
                      <td style="vertical-align: middle">
                        <button class="btn btn-sm btn-outline-primary edit-time-location"
                          data-garbage-id="${garbage._id}"
                          data-schedule-id="${schedule._id}"
                          data-time-location-id="${loc._id}">
                          Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-time-location"
                          data-garbage-id="${garbage._id}"
                          data-schedule-id="${schedule._id}"
                          data-time-location-id="${loc._id}">
                          Delete
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
}

export default renderCollections;