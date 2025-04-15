const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drvzzhrjy";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "724781527252967";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "Cooup_cdWYRrsWt6Ys34nvgqBNY";

export const generateSignature = (params: Record<string, string>) => {
  const crypto = require('crypto');
  
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params).sort().reduce((acc: Record<string, string>, key) => {
    acc[key] = params[key];
    return acc;
  }, {});
  
  // Create string to sign
  const stringToSign = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // Append API secret
  const signatureString = stringToSign + CLOUDINARY_API_SECRET;
  
  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(signatureString).digest('hex');
};

export const uploadToCloudinary = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Attempting to upload image:', imageUrl);
    
    // For data URLs, convert to blob directly
    let blob;
    if (imageUrl.startsWith('data:')) {
      console.log('Processing base64 image data');
      const base64Data = imageUrl.split(',')[1];
      
      // Use Buffer in Node.js environment
      let byteArray;
      try {
        // For Node.js environment
        const buffer = Buffer.from(base64Data, 'base64');
        byteArray = new Uint8Array(buffer);
        console.log('Used Buffer for base64 decoding');
      } catch (e) {
        // For browser/Edge environment
        console.log('Falling back to atob for base64 decoding');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        byteArray = new Uint8Array(byteNumbers);
      }
      
      blob = new Blob([byteArray], { type: 'image/png' });
      console.log('Created blob from base64 data');
      console.log('Blob size:', blob.size, 'bytes');
    } else {
      // For URLs, fetch first
      const imageResponse = await fetch(imageUrl);
      blob = await imageResponse.blob();
    }
    
    // Create parameters for signature
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const params = {
      timestamp,
      transformation: 'q_auto'
    };
    
    // Generate signature with all parameters
    const signature = generateSignature(params);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('transformation', 'q_auto');
    formData.append('signature', signature);
    
    console.log('Uploading to Cloudinary with cloud_name:', CLOUDINARY_CLOUD_NAME);
    
    // Upload to Cloudinary using the upload API
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await uploadResponse.json();
    console.log('Cloudinary response:', data);
    
    if (!uploadResponse.ok) {
      throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
    }
    
    // Return the original URL without transformations
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};