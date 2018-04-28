const PDFDocument = require('pdfkit')
const blobStream = require('blob-stream')

const getFormData = () => {
	const $ = document.querySelector.bind(document)

	return {
		eventName: $('#event-name').value,
		date: $('#date').value,
		startTime: $('#start-time').value,
		endTime: $('#end-time').value,
		requesterName: $('#requester-name').value,
		requesterContact: $('#requester-contact').value,
	}
}

const getImageDataUri = url => {
	return new Promise(resolve => {
		const image = new Image()
		image.crossOrigin = 'anonymous'
		image.onload = function () {
			const canvas = document.createElement('canvas')
			canvas.width = this.naturalWidth
			canvas.height = this.naturalHeight

			canvas.getContext('2d').drawImage(this, 0, 0)

			resolve(canvas.toDataURL('image/png'))
		}

		image.src = url
	})
}

const createPdfBlob = ({ eventName, date, startTime, endTime, requesterName, requesterContact }, dataUri) => {
	return new Promise(resolve => {
		const pdf = new PDFDocument()

		const stream = pdf.pipe(blobStream())

		pdf.image(dataUri, 0, 0, {
			width: pdf.page.width,
			height: pdf.page.height,
		})

		pdf.text(eventName, 430, 115)
		pdf.text(date, 200, 242)
		pdf.text(startTime, 230, 255)
		pdf.text(endTime, 330, 255)

		pdf.text(`${requesterName}    ${requesterContact}`, 220, 465)
		pdf.text(new Date().toLocaleDateString(), 220, 500)

		pdf.end()

		stream.on('finish', () => {
			const blob = stream.toBlob('application/pdf')
			const url = stream.toBlobURL('application/pdf')
			resolve(blob)
		})
	})
}

const addLink = (date, blob) => {
	return new Promise(resolve => {
		const linkId = 'download-link'
		document.querySelectorAll(linkId).forEach(e => e.remove())

		const link = document.createElement('a')
		link.innerText = 'Download'
		link.download = `air con request for ${date}`
		link.id = linkId
		link.href = URL.createObjectURL(blob)
		link.style.display = 'none'

		document.body.appendChild(link)
		link.click()

		resolve(link)
	})
}

const submit = (event) => {
	event.preventDefault()

	document.body.classList.add('loading')

	const eventDetails = getFormData()

	getImageDataUri('https://s3-ap-southeast-1.amazonaws.com/spinningarrow/aircon-new.png')
		.then(createPdfBlob.bind(null, eventDetails))
		.then(addLink.bind(null, eventDetails.date))
		.then(() => document.body.classList.remove('loading'))
		.catch(() => document.body.classList.remove('loading'))
}

window.submit = submit
