// // import { asyncHandler } from '../../utils/asyncHandler.js';
// // import * as service from './clfResource.service.js';

// // /* ─── Lokos CRP ─── */
// // export const createLokos = asyncHandler(async (req, res) => {
// //   const doc = await service.createLokosCrp(req, req.body);
// //   res.status(201).json({ success: true, data: doc });
// // });

// // export const listLokos = asyncHandler(async (req, res) => {
// //   const result = await service.listLokosCrps(req, req.query);
// //   res.json({ success: true, data: result });
// // });

// // export const getLokos = asyncHandler(async (req, res) => {
// //   const doc = await service.getLokosCrp(req, req.params.id);
// //   res.json({ success: true, data: doc });
// // });

// // export const updateLokos = asyncHandler(async (req, res) => {
// //   const doc = await service.updateLokosCrp(req, req.params.id, req.body);
// //   res.json({ success: true, data: doc });
// // });

// // export const deleteLokos = asyncHandler(async (req, res) => {
// //   const result = await service.deleteLokosCrp(req, req.params.id);
// //   res.json({ success: true, data: result });
// // });

// // /* ─── VO ─── */
// // export const createVo = asyncHandler(async (req, res) => {
// //   const doc = await service.createVo(req, req.body);
// //   res.status(201).json({ success: true, data: doc });
// // });

// // export const listVos = asyncHandler(async (req, res) => {
// //   const result = await service.listVos(req, req.query);
// //   res.json({ success: true, data: result });
// // });

// // export const getVo = asyncHandler(async (req, res) => {
// //   const doc = await service.getVo(req, req.params.id);
// //   res.json({ success: true, data: doc });
// // });

// // export const updateVo = asyncHandler(async (req, res) => {
// //   const doc = await service.updateVo(req, req.params.id, req.body);
// //   res.json({ success: true, data: doc });
// // });

// // export const deleteVo = asyncHandler(async (req, res) => {
// //   const result = await service.deleteVo(req, req.params.id);
// //   res.json({ success: true, data: result });
// // });



// import { asyncHandler } from '../../utils/asyncHandler.js';
// import * as service from './clfResource.service.js';
// import * as adviceService from './clfResourceAdvice.service.js'; // ✅ Import for PDF

// /* ─── Lokos CRP ─── */
// export const createLokos = asyncHandler(async (req, res) => {
//   const doc = await service.createLokosCrp(req, req.body);
//   res.status(201).json({ success: true, data: doc });
// });

// export const listLokos = asyncHandler(async (req, res) => {
//   const result = await service.listLokosCrps(req, req.query);
//   res.json({ success: true, data: result });
// });

// export const getLokos = asyncHandler(async (req, res) => {
//   const doc = await service.getLokosCrp(req, req.params.id);
//   res.json({ success: true, data: doc });
// });

// export const updateLokos = asyncHandler(async (req, res) => {
//   const doc = await service.updateLokosCrp(req, req.params.id, req.body);
//   res.json({ success: true, data: doc });
// });

// export const deleteLokos = asyncHandler(async (req, res) => {
//   const result = await service.deleteLokosCrp(req, req.params.id);
//   res.json({ success: true, data: result });
// });

// /* ─── VO ─── */
// export const createVo = asyncHandler(async (req, res) => {
//   const doc = await service.createVo(req, req.body);
//   res.status(201).json({ success: true, data: doc });
// });

// export const listVos = asyncHandler(async (req, res) => {
//   const result = await service.listVos(req, req.query);
//   res.json({ success: true, data: result });
// });

// export const getVo = asyncHandler(async (req, res) => {
//   const doc = await service.getVo(req, req.params.id);
//   res.json({ success: true, data: doc });
// });

// export const updateVo = asyncHandler(async (req, res) => {
//   const doc = await service.updateVo(req, req.params.id, req.body);
//   res.json({ success: true, data: doc });
// });

// export const deleteVo = asyncHandler(async (req, res) => {
//   const result = await service.deleteVo(req, req.params.id);
//   res.json({ success: true, data: result });
// });

// /* ─── Generate Advice ─── */
// export const generateResourceAdvice = asyncHandler(async (req, res) => {
//   const { type, ids, month, selectedBank, chequeNo } = req.body;
  
//   if (!ids || !ids.length) {
//     throw new Error('Select at least one resource');
//   }
  
//   await adviceService.generateResourceAdvicePDF(req, res, { 
//     type, 
//     ids, 
//     month, 
//     selectedBank, 
//     chequeNo 
//   });
// });




// import { asyncHandler } from '../../utils/asyncHandler.js';
// import * as service from './clfResource.service.js';
// import * as adviceService from './clfResourceAdvice.service.js'; 

// /* ─── Lokos CRP ─── */
// export const createLokos = asyncHandler(async (req, res) => {
//   const doc = await service.createLokosCrp(req, req.body);
//   res.status(201).json({ success: true, data: doc });
// });

// export const listLokos = asyncHandler(async (req, res) => {
//   const result = await service.listLokosCrps(req, req.query);
//   res.json({ success: true, data: result });
// });

// export const getLokos = asyncHandler(async (req, res) => {
//   const doc = await service.getLokosCrp(req, req.params.id);
//   res.json({ success: true, data: doc });
// });

// export const updateLokos = asyncHandler(async (req, res) => {
//   const doc = await service.updateLokosCrp(req, req.params.id, req.body);
//   res.json({ success: true, data: doc });
// });

// export const deleteLokos = asyncHandler(async (req, res) => {
//   const result = await service.deleteLokosCrp(req, req.params.id);
//   res.json({ success: true, data: result });
// });

// /* ─── VO ─── */
// export const createVo = asyncHandler(async (req, res) => {
//   const doc = await service.createVo(req, req.body);
//   res.status(201).json({ success: true, data: doc });
// });

// export const listVos = asyncHandler(async (req, res) => {
//   const result = await service.listVos(req, req.query);
//   res.json({ success: true, data: result });
// });

// export const getVo = asyncHandler(async (req, res) => {
//   const doc = await service.getVo(req, req.params.id);
//   res.json({ success: true, data: doc });
// });

// export const updateVo = asyncHandler(async (req, res) => {
//   const doc = await service.updateVo(req, req.params.id, req.body);
//   res.json({ success: true, data: doc });
// });

// export const deleteVo = asyncHandler(async (req, res) => {
//   const result = await service.deleteVo(req, req.params.id);
//   res.json({ success: true, data: result });
// });

// /* ─── Generate Resource Advice (Lokos/VO) ─── */
// export const generateResourceAdvice = asyncHandler(async (req, res) => {
//   const { type, ids, month, adviceDate, adviceNumber, amount, selectedBank, chequeNo } = req.body;
  
//   if (!ids || !ids.length) {
//     throw new Error('Select at least one resource to generate advice');
//   }
//   if (!amount || amount <= 0) {
//     throw new Error('Valid amount is required');
//   }
  
//   await adviceService.generateResourceAdvicePDF(req, res, { 
//     type, 
//     ids, 
//     month, 
//     adviceDate, 
//     adviceNumber, 
//     amount: Number(amount), 
//     selectedBank, 
//     chequeNo 
//   });
// });



import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './clfResource.service.js';
import * as adviceService from './clfResourceAdvice.service.js'; 

/* ─── Lokos CRP ─── */
export const createLokos = asyncHandler(async (req, res) => {
  const doc = await service.createLokosCrp(req, req.body);
  res.status(201).json({ success: true, data: doc });
});

export const listLokos = asyncHandler(async (req, res) => {
  const result = await service.listLokosCrps(req, req.query);
  res.json({ success: true, data: result });
});

export const getLokos = asyncHandler(async (req, res) => {
  const doc = await service.getLokosCrp(req, req.params.id);
  res.json({ success: true, data: doc });
});

export const updateLokos = asyncHandler(async (req, res) => {
  const doc = await service.updateLokosCrp(req, req.params.id, req.body);
  res.json({ success: true, data: doc });
});

export const deleteLokos = asyncHandler(async (req, res) => {
  const result = await service.deleteLokosCrp(req, req.params.id);
  res.json({ success: true, data: result });
});

/* ─── VO ─── */
export const createVo = asyncHandler(async (req, res) => {
  const doc = await service.createVo(req, req.body);
  res.status(201).json({ success: true, data: doc });
});

export const listVos = asyncHandler(async (req, res) => {
  const result = await service.listVos(req, req.query);
  res.json({ success: true, data: result });
});

export const getVo = asyncHandler(async (req, res) => {
  const doc = await service.getVo(req, req.params.id);
  res.json({ success: true, data: doc });
});

export const updateVo = asyncHandler(async (req, res) => {
  const doc = await service.updateVo(req, req.params.id, req.body);
  res.json({ success: true, data: doc });
});

export const deleteVo = asyncHandler(async (req, res) => {
  const result = await service.deleteVo(req, req.params.id);
  res.json({ success: true, data: result });
});

/* ─── Generate Resource Advice (Lokos/VO) ─── */
export const generateResourceAdvice = asyncHandler(async (req, res) => {
  const { type, ids, month, adviceDate, adviceNumber, amounts, selectedBank } = req.body;
  
  if (!ids || !ids.length) {
    throw new Error('Select at least one resource to generate advice');
  }
  
  if (!amounts || !Array.isArray(amounts) || amounts.length === 0) {
    throw new Error('Valid amount is required');
  }
  
  await adviceService.generateResourceAdvicePDF(req, res, { 
    type, 
    ids, 
    month, 
    adviceDate, 
    adviceNumber, 
    amounts, // ✅ Array pass kiya
    selectedBank
  });
});