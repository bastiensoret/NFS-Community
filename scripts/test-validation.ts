import { jobPostingSchema } from '../lib/validations';

const body = {
  jobTitle: 'New Job',
  companyName: 'Acme Inc',
  location: 'Brussels',
  country: 'Belgium',
  seniorityLevel: 'Junior',
  status: 'ACTIVE'
};

try {
  console.log("Testing status: ACTIVE");
  const result = jobPostingSchema.parse(body);
  console.log("Validation Successful. Result status:", result.status);
} catch (error: any) {
  console.error("Validation Failed:");
  console.error(JSON.stringify(error.errors || error, null, 2));
}
