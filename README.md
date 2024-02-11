# Yacht Charter - Yet Another CHart Tool ⛵📊

Yacht Charter is a charting tool made by the Australian part of The Guardian. This is the front-end part of Yacht Charter. The backend and admin are currently under development!

Yacht makes responsive charts with labels in a wider variety of formats than previous Guardian chart tools, and it supports programmatic chart updating as well as editing-in-place.

For example it supports: [scatterplots with trendlines](https://interactive.guim.co.uk/embed/superyacht/index.html?key=1EbFtLna39KLlDL-M0QVu0TNZUHkfTS_kRH1GwkeHHD4&location=docsdata), stacked areas, small multiples, dumbbell, bubble and [beeswarm charts](https://interactive.guim.co.uk/embed/superyacht/index.html?location=docsdata&key=1hbFGwheOCIpdIAP9x09HWxTYI5lQC73MXIZy_GM7Zkg), as well as line, column and [bar charts](https://interactive.guim.co.uk/embed/superyacht/index.html?location=docsdata&key=17rVwplGRJP0VIx5MilM_bTr1XLD91TKrBlnn_Y_9A_o).

Yacht supports making responsive charts in the following ways:

* Through the [Yacht Charter admin](https://pollarama.herokuapp.com/)
* By using a Google sheet converted to JSON and synced to S3 (manually via [visuals/docs](https://visuals.gutools.co.uk/docs/)) or in the [admin](https://pollarama.herokuapp.com/)
* By using a JSON file written directly to S3 from Python or Node.js. We have a Python library to help with this, which you can install like so: ```pip install yachtcharter```

