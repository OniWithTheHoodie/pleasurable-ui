// Importeerd npm pakket express uit de node_modules map
import express from 'express'
// Importeerd de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// variable voor de index route
const apiUrl = 'https://fdnd-agency.directus.app/items/'
const huizenHome = await fetchJson(apiUrl + 'f_houses')
const feedback = await fetchJson(apiUrl + 'f_feedback')

//
// let ratings = ''
let ratings = []

// hier maak ik een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')
// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources
app.use(express.static('public'))

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({ extended: true }))

// Get Route voor de index
app.get('/', function (request, response) {
  // fetch data directus table f_feedback
  fetchJson(apiUrl + 'f_feedback').then((BeoordelingData) => {
    // console.log(BeoordelingData)

    response.render('index', {
      alleHuizen: huizenHome.data,
      alleRatings: feedback.data,
      ratings: ratings,
    })
    // console.log(ratings)
  })
})

app.post('/', function (request, response) {
  console.log(request.body)

  // posten naar directus..
  fetch(`${apiUrl}f_feedback/`, {
    method: 'POST',
    body: JSON.stringify({
      house: request.body.id,
      list: 12,
      user: 7,
      rating: {
        stars: request.body.stars,
      },
    }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  }).then((postResponse) => {
    console.log(postResponse)
    response.redirect(303, '/')
  })
})

app.get('/huis/:id', function (request, response) {
  // request.params.id gebruik je zodat je de exacte huis kan weergeven dit is een routeparmater naar de route van die huis
  const url = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*.*`
  fetchJson(url)
    .then((apiData) => {
      if (apiData.data) {
        /*als data voer dan dit uit */
        // console.log('data bestaat u gaat nu naar de Detailpage page'+JSON.stringify(apiData))
        // info gebruiken om die te linken aan apidata.data
        response.render('huis', { house: apiData.data })
        // console.log(apiData)
      } else {
        console.log('No data found for house with id: ' + request.params.id)
        //     laat de error zien als de data al niet gevonden word
      }
    })
    .catch((error) => {
      console.error('Error fetching house data:', error)
    })
})

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})