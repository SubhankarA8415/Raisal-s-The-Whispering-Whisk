import {
  getBakeryStatus,
  updateBakeryClosure,
  createOperatingHour,
  updateOperatingHour,
  deleteOperatingHour,
} from '../services/bakeryService.js'

export async function getStatus(req, res, next) {
  try {
    res.status(200).json({ success: true, data: await getBakeryStatus() })
  } catch (error) { next(error) }
}

export async function getAdminStatus(req, res, next) {
  try {
    res.status(200).json({ success: true, data: await getBakeryStatus() })
  } catch (error) { next(error) }
}

export async function patchClosure(req, res, next) {
  try {
    const { isClosed, note } = req.body
    const closure = await updateBakeryClosure(isClosed, note)
    res.status(200).json({ success: true, data: { closure } })
  } catch (error) { next(error) }
}

export async function postHour(req, res, next) {
  try {
    const hour = await createOperatingHour(req.body)
    res.status(201).json({ success: true, data: { hour } })
  } catch (error) { next(error) }
}

export async function patchHour(req, res, next) {
  try {
    const hour = await updateOperatingHour(req.params.id, req.body)
    res.status(200).json({ success: true, data: { hour } })
  } catch (error) { next(error) }
}

export async function removeHour(req, res, next) {
  try {
    const data = await deleteOperatingHour(req.params.id)
    res.status(200).json({ success: true, data })
  } catch (error) { next(error) }
}
