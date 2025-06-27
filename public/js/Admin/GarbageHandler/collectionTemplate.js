/* eslint-disable */

function renderCollections(collections) {
  this.garbageList.innerHTML = collections.map(garbage => `
      <div class="card mb-3">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0 text-slate-900 fw-bold">Phase ${garbage.phase}</h5>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm bg-green-700 add-day text-slate-100 fw-semibold" data-garbage-id="${garbage._id}">
              Add Day
            </button>
            <button class="btn btn-sm edit-phase-number border border-green-700 text-green-700 fw-semibold" data-bs-toggle="modal" data-bs-target="#garbageModal" data-garbage-id="${garbage._id}">
              Edit Phase Number
            </button>
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
                    <th class="text-slate-700 fw-semibold">Time</th>
                    <th class="text-slate-700 fw-semibold">Streets</th>
                    <th class="text-slate-700 fw-semibold">Actions</th>
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