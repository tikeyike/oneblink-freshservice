'use strict'

const axios = require('axios')
const boom = require('@hapi/boom')
const oneblink = require('@oneblink/sdk')

const formsSDK = new oneblink.Forms({
  accessKey: process.env.FORMS_ACCESS_KEY,
  secretKey: process.env.FORMS_SECRET_KEY,
})

module.exports.post = async function webhook(req) {
  console.log('🔍 Validating webhook request payload')
  if (
    !req.body ||
    !req.body.formId ||
    !req.body.submissionId ||
    !req.body.secret
  ) {
    throw boom.badRequest('🛑 Invalid webhook request payload', req.body)
  }

  console.log('✅ Authorising webhook request')
  if (req.body.secret !== process.env.WEB_HOOK_SECRET) {
    throw boom.forbidden('🛑 Unauthorised', req.body)
  }

  console.log('🎣 Retrieving form data for submission', {
    formId: req.body.formId,
    submissionId: req.body.submissionId,
    isDraft: req.body.isDraft,
  })

  const { submission, definition } = await formsSDK.getSubmissionData(
    req.body.formId,
    req.body.submissionId,
    req.body.isDraft
  )

  console.log(submission)

  let html = `
    <div style="max-width: 640px; margin: auto; display: grid;">

    <div style="font-weight: 600; padding-top: 0.5rem;">Choose Request for Payment Type</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
      submission.Choose_Request_for_Payment_Type
    }</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">Name</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
      submission.Name
    }</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">Email</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
      submission.Email
    }</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">Contact Number</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
      submission.Contact_Number
    }</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">Does this reimbursement relate to a jobseeker expense purchased using your own funds?</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
      submission.Jobseeker_Expense
    }</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">Payments</div>

    <div style="margin: 1rem;">
      ${
        Array.isArray(submission.addPayment) &&
        submission.addPayment
          .map((payment) => {
            return `
          <div style="border-left: 4px solid #CFD7DF; border-radius: 0; padding: 0 1rem; margin-bottom: 2rem;">

          <div style="font-weight: 600; padding-top: 0.5rem;">Date</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
              payment.Date
            }</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">Paid To</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
              payment.paidTo
            }</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">Description</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
              payment.Description
            }</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">TechOne Code</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
              payment.TechOneCode
            }</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">Receipt Amount</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${Intl.NumberFormat(
              'en-AU',
              {
                style: 'currency',
                currency: 'AUD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ).format(payment.Net_Amount)}</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">GST Included?</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
              payment.GST_Included
            }</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">GST Amount</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${
              payment.GST_Amount
                ? Intl.NumberFormat('en-AU', {
                    style: 'currency',
                    currency: 'AUD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(payment.GST_Amount)
                : 'Included'
            }</p>

            <div style="font-weight: 600; padding-top: 0.5rem;">Gross Amount</div>
            <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${Intl.NumberFormat(
              'en-AU',
              {
                style: 'currency',
                currency: 'AUD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ).format(payment.Gross_Amount)}</p>

          </div>
        `
          })
          .join('')
      }
    </div>

    <div style="font-weight: 600; padding-top: 0.5rem;">Net Total</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(submission.Net_Total)}</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">GST Total</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(submission.GST_Total)}</p>

    <div style="font-weight: 600; padding-top: 0.5rem;">Gross Total</div>
    <p style="padding: 0.75rem 1rem; border: 2px solid #CFD7DF; width: auto; border-radius: 4px; margin-top: 0.5rem;">${Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(submission.Gross_Total)}</p>

    </div>
  `

  let data = {
    email: submission.Email,
    subject: definition.name,
    description: html,
    type: 'Incident',
    source: 1,
    status: 2,
    priority: 1,
  }

  let config = {
    method: 'post',
    url:
      'https://' +
      process.env.FRESHSERVICE_ENDPOINT +
      '.freshservice.com/api/v2/tickets',
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: process.env.FRESHSERVICE_API_KEY,
      password: 'X',
    },
    data: data,
  }

  await axios(config)
    .then((response) => {
      console.log(JSON.stringify(response.data, null, 2))
    })
    .catch((error) => {
      console.log(error.response.data)
    })

  console.log('🎉 Webhook completed successfully')
}
