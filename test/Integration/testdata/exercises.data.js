function isodate (y, m, d, t1, t2, t3) {
  return new Date(Date.UTC(2000, 0, 1, 0, 0, 0)).toISOString()
}
module.exports = () => {
  return {
    exercises: {
      '1ff6440d15729b5df16823e3': {
        owner: '1ff6440d15729b5df16823e3',
        path: [{
          coords: { lat: 0, lng: 0 },
          elevation: 50,
          timestamp: isodate(2000, 0, 1, 0, 0, 0)
        }],
        timestamps: {
          start_date: isodate(2000, 0, 1, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [],
        verified: true
      },
      '2ff6440d15729b5df16823e3': {
        owner: '2ff6440d15729b5df16823e3',
        path: [],
        timestamps: {
          start_date: isodate(2000, 0, 1, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [],
        verified: true
      },
      '3ff6440d15729b5df16823e3': {
        owner: '2ff6440d15729b5df16823e3',
        path: [],
        timestamps: {
          start_date: isodate(2000, 0, 2, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [],
        verified: true
      },
      '4ff6440d15729b5df16823e3': {
        owner: '2ff6440d15729b5df16823e3',
        path: [],
        timestamps: {
          start_date: isodate(2000, 0, 3, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [],
        verified: true
      },
      '5ff6440d15729b5df16823e3': {
        owner: '3ff6440d15729b5df16823e3',
        path: [],
        timestamps: {
          start_date: isodate(2000, 0, 3, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [{ emoji: 'Wow', user: '4ff6440d15729b5df16823e3' }],
        verified: true
      },
      '6ff6440d15729b5df16823e3': {
        owner: '4ff6440d15729b5df16823e3',
        path: [
          {
            coords: { lat: 52.191481, lng: -0.884400 },
            elevation: 50,
            timestamp: isodate(2000, 0, 3, 0, 0, 1)
          },
          {
            coords: { lat: 52.373150, lng: -1.866471 },
            elevation: 50,
            timestamp: isodate(2000, 0, 3, 0, 0, 2)
          },
          {
            coords: { lat: 53.449059, lng: -2.256744 },
            elevation: 50,
            timestamp: isodate(2000, 0, 3, 0, 0, 3)
          }
        ],
        timestamps: {
          start_date: isodate(2000, 0, 3, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [{ emoji: 'Wow', user: '4ff6440d15729b5df16823e3' }],
        verified: true
      },
      '7ff6440d15729b5df16823e3': {
        owner: '5ff6440d15729b5df16823e3',
        path: [],
        timestamps: {
          start_date: isodate(2000, 0, 3, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [{ emoji: 'Wow', user: '4ff6440d15729b5df16823e3' }],
        verified: true
      },
      '8ff6440d15729b5df16823e3': {
        owner: '6ff6440d15729b5df16823e3',
        path: [
          {
            coords: { lat: 52.373150, lng: -1.866471 },
            elevation: 50,
            timestamp: isodate(2000, 0, 3, 0, 0, 2)
          },
          {
            coords: { lat: 53.449059, lng: -2.256744 },
            elevation: 50,
            timestamp: isodate(2000, 0, 3, 0, 0, 3)
          }
        ],
        timestamps: {
          start_date: isodate(2000, 0, 3, 0, 0, 0),
          end_date: isodate(2000, 0, 1, 0, 0, 0)
        },
        kudos: [{ emoji: 'Wow', user: '4ff6440d15729b5df16823e3' }],
        verified: true
      }
    }
  }
}
