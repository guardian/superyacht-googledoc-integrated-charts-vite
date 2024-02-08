# Yet Another CHart Tool ⛵📊

Yacht Charter is a charting tool made by the Australian part of The Guardian. This is the front-end part of Yacht Charter. The backend and admin are currently under development!

Yacht makes responsive charts with labels in a wider variety of formats than previous Guardian chart tools, and it supports programmatic chart updating as well as editing-in-place.

Yacht supports making responsive charts in the following ways:

* Through the [Yacht Charter admin](https://pollarama.herokuapp.com/)
* By using a Google sheet converted to JSON and synced to S3 (manually via [visuals/docs](https://visuals.gutools.co.uk/docs/)) or in the [admin](https://pollarama.herokuapp.com/)
* By using a JSON file written directly to S3 from Python or Node.js. We have a Python library to help with this, which you can install like so: ```pip install yachtcharter```

