import type { Business } from "../types";
import { api, getErrorMessage } from "./client";

export async function getMyBusinessesApi(): Promise<Business[]> {
  try {
    const { data } = await api.get<Business[]>(`/businesses/my-businesses`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch businesses"));
  }
}

export async function getBusinessApi(business_id: string): Promise<Business[]> {
  try {
    const { data } = await api.get<Business[]>(`/businesses/${business_id}`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch businesses"));
  }
}

export async function createBusinessApi(data: Partial<Business>): Promise<Business> {
  console.log(data);
  try {
    const { data: business } = await api.post<Business>("/businesses", data);
    console.log("business", business);
    return business;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to create a business"));
  }
}
 
export async function updateBusinessApi(business_id: string, data: FormData): Promise<Business> {
  try {
    const { data: updatedBusiness } = await api.put<Business>(`/businesses/${business_id}`, data);
    // console.log(data);
    return updatedBusiness;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to update a business"));
  }
}

// export async function deleteJobApi(id: string): Promise<void> {
//   try {
//     await api.delete(`/jobs/${id}`);
//   } catch (e) {
//     throw new Error(getErrorMessage(e, "Failed to delete job"));
//   }
// }

// export async function approveJobApi(id: string): Promise<void> {
//   try {
//     await api.put(`/admin/approve-job/${id}`);
//   } catch (e) {
//     throw new Error(getErrorMessage(e, "Failed to approve job"));
//   }
// }

// export async function applyJobApi(id: string): Promise<void> {
//   try {
//     await api.post(`/jobs/${id}/apply`);
//   } catch (e) {
//     throw new Error(getErrorMessage(e, "Failed to apply"));
//   }
// }

// export interface JobStats {
//   totalAvailable: number;
//   applied: number;
//   remaining: number;
// }

// export const getJobStatsApi = async (): Promise<JobStats> => {
//   const { data } = await api.get<{ success: boolean; stats: JobStats }>(
//     "/jobs/stats",
//   );
//   return data.stats;
// };

// export interface CountJobs {
//   jobs: number;
// }
// // ringo``
// export async function countJobsApi(): Promise<CountJobs>{
//   try {
//     const { data } = await api.get<CountJobs>("/jobs/count");
//     return data;
//   } catch (e) {
//     throw new Error(getErrorMessage(e, "Failed to fetch total jobs"));
//   }
// };

export async function getAllBusinessesApi(): Promise<Business[]>{
  try {
    const { data } = await api.get("/businesses");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch businesses"));
  }
};
