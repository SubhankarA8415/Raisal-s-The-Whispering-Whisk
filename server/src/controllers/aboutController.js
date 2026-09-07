import { getPublicAbout, getAdminAbout, createTeamMember, updateTeamMember, deleteTeamMember, createSection, updateSection, deleteSection } from '../services/aboutService.js'

export async function getAbout(req,res,next){ try { return res.json({success:true,data:await getPublicAbout()}) } catch(e){ next(e) } }
export async function getAdminAboutData(req,res,next){ try { return res.json({success:true,data:await getAdminAbout()}) } catch(e){ next(e) } }
export async function postTeamMember(req,res,next){ try { return res.status(201).json({success:true,data:{member:await createTeamMember(req.body||{})}}) } catch(e){ next(e) } }
export async function patchTeamMember(req,res,next){ try { return res.json({success:true,data:{member:await updateTeamMember(req.params.id,req.body||{})}}) } catch(e){ next(e) } }
export async function removeTeamMember(req,res,next){ try { return res.json({success:true,data:await deleteTeamMember(req.params.id)}) } catch(e){ next(e) } }
export async function postSection(req,res,next){ try { return res.status(201).json({success:true,data:{section:await createSection(req.body||{})}}) } catch(e){ next(e) } }
export async function patchSection(req,res,next){ try { return res.json({success:true,data:{section:await updateSection(req.params.id,req.body||{})}}) } catch(e){ next(e) } }
export async function removeSection(req,res,next){ try { return res.json({success:true,data:await deleteSection(req.params.id)}) } catch(e){ next(e) } }
