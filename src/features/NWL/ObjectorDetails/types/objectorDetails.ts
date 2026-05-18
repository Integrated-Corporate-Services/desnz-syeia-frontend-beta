export type ObjectorDetails = {
  objector_title?: string;
  objector_full_name?: string;
  objector_email?: string;
  objector_phone?: string;
  objector_address_line1?: string;
  objector_address_line2?: string;
  objector_town?: string;
  objector_county?: string;
  objector_postcode?: string;
  
  is_landowner?: boolean;
  landowner_title?: string;
  landowner_full_name?: string;
  landowner_email?: string;
  landowner_phone?: string;
  landowner_address_line1?: string;
  landowner_address_line2?: string;
  landowner_town?: string;
  landowner_county?: string;
  landowner_postcode?: string;
  
  has_representative?: boolean;
  representative_title?: string;
  representative_full_name?: string;
  representative_email?: string;
  representative_phone?: string;
  representative_address_line1?: string;
  representative_address_line2?: string;
  representative_town?: string;
  representative_county?: string;
  representative_postcode?: string;
};

export type PersonFormData = {
  title: string;
  fullName: string;
  email: string;
  phone: string;
};

export type AddressFormData = {
  addressLine1: string;
  addressLine2: string;
  town: string;
  county: string;
  postcode: string;
};

export type FormErrors = {
  [key: string]: string;
};
