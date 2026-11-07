import mongoose from 'mongoose';

const bankDetailsSchema = {
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  ifscCode: { type: String, trim: true, uppercase: true },
  branch: { type: String, trim: true },
};

const clfSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    loginId: { type: String, trim: true, lowercase: true },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    bpmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    village: { type: String, trim: true },
    location: { type: String, trim: true },

    // ✅ DYNAMIC LETTERHEAD (Default Logos set)
    letterhead: {
      subTitle: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      registrationNo: { type: String, trim: true },
      leftLogo: { 
        type: String, 
        trim: true, 
        default: 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380290/WhatsApp_Image_2026-09-14_at_1.07.08_PM_nbbmda.jpg' 
      },
      rightLogo: { 
        type: String, 
        trim: true, 
        default: 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380471/WhatsApp_Image_2026-09-14_at_1.07.10_PM_owpahi.jpg' 
      },
    },
    
    // ✅ DYNAMIC FOOTER
    footer: {
      blockOffice: { type: String, trim: true },
      districtOffice: { type: String, trim: true },
      stateOffice: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    
    // ✅ DYNAMIC SIGNATURES (Default set)
    signatures: {
      first: { type: String, trim: true, default: 'अध्यक्ष' },
      second: { type: String, trim: true, default: 'सचिव' },
      third: { type: String, trim: true, default: 'कोषाध्यक्ष' },
    },

    // ✅ CLF ke khud ke multiple bank accounts
    bankAccounts: [
      {
        accountName: { type: String, trim: true, required: true },
        bankName: { type: String, trim: true, required: true },
        accountNumber: { type: String, trim: true, required: true },
        ifscCode: { type: String, trim: true, uppercase: true },
        branch: { type: String, trim: true },
      }
    ],

    coreMembers: {
      president: { name: { type: String, trim: true }, mobile: { type: String, trim: true }, address: { type: String, trim: true }, bankDetails: bankDetailsSchema },
      secretary: { name: { type: String, trim: true }, mobile: { type: String, trim: true }, address: { type: String, trim: true }, bankDetails: bankDetailsSchema },
      treasurer: { name: { type: String, trim: true }, mobile: { type: String, trim: true }, address: { type: String, trim: true }, bankDetails: bankDetailsSchema },
    },

    bodMembers: [
      {
        name: { type: String, required: true, trim: true },
        designation: { type: String, enum: ['BOD Manager', 'CLF Manager', 'Accountant', 'MIS', 'Other'], trim: true },
        mobile: { type: String, trim: true },
        address: { type: String, trim: true },
        bankDetails: bankDetailsSchema,
        status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    contact: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

clfSchema.index({ blockId: 1, status: 1 });

export const CLF = mongoose.model('CLF', clfSchema);