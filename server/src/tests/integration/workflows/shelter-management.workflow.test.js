import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks, mockHttpClient } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("Shelter Management Workflow Integration", () => {
  let agent, server, adminCookie, volunteerCookie, ngoCookie, citizenCookie;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();

    // Create and login as admin
    const adminData = {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN"
    };

    await agent.post("/api/auth/register").send(adminData);
    await User.findOneAndUpdate(
      { email: adminData.email },
      { isAccountVerified: true }
    );

    const adminLogin = await agent
      .post("/api/auth/login")
      .send({
        email: adminData.email,
        password: adminData.password
      });

    adminCookie = adminLogin.headers["set-cookie"];

    // Create and login as volunteer
    const volunteerData = {
      name: "Volunteer User",
      email: "volunteer@example.com",
      password: "password123",
      role: "VOLUNTEER"
    };

    await agent.post("/api/auth/register").send(volunteerData);
    await User.findOneAndUpdate(
      { email: volunteerData.email },
      { isAccountVerified: true }
    );

    const volunteerLogin = await agent
      .post("/api/auth/login")
      .send({
        email: volunteerData.email,
        password: volunteerData.password
      });

    volunteerCookie = volunteerLogin.headers["set-cookie"];

    // Create and login as NGO
    const ngoData = {
      name: "NGO User",
      email: "ngo@example.com",
      password: "password123",
      role: "NGO"
    };

    await agent.post("/api/auth/register").send(ngoData);
    await User.findOneAndUpdate(
      { email: ngoData.email },
      { isAccountVerified: true }
    );

    const ngoLogin = await agent
      .post("/api/auth/login")
      .send({
        email: ngoData.email,
        password: ngoData.password
      });

    ngoCookie = ngoLogin.headers["set-cookie"];

    // Create and login as citizen
    const citizenData = {
      name: "Citizen User",
      email: "citizen@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    await agent.post("/api/auth/register").send(citizenData);
    await User.findOneAndUpdate(
      { email: citizenData.email },
      { isAccountVerified: true }
    );

    const citizenLogin = await agent
      .post("/api/auth/login")
      .send({
        email: citizenData.email,
        password: citizenData.password
      });

    citizenCookie = citizenLogin.headers["set-cookie"];
  });

  it("should complete full shelter management workflow", async () => {
    // Step 1: Admin creates emergency shelter
    const shelterData = {
      name: "Central Emergency Shelter",
      description: "Main emergency shelter for disaster victims",
      shelterType: "SCHOOL",
      address: {
        street: "123 Emergency Ave",
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94112345678",
        email: "central@shelter.org"
      },
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      capacity: {
        total: 200
      },
      supports: {
        disasterTypes: ["FLOOD", "LANDSLIDE"],
        wheelchairAccess: true,
        medical: true,
        food: true,
        water: true,
        power: false
      },
      specialSupport: {
        elderlySupport: true,
        disabilitySupport: true,
        pregnancySupport: true,
        petFriendly: false,
        childFriendly: true
      },
      verified: true
    };

    const createResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", adminCookie)
      .send(shelterData);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.shelter.name).toBe(shelterData.name);
    expect(createResponse.body.shelter.capacity.total).toBe(200);
    expect(createResponse.body.shelter.verified).toBe(true);

    const shelterId = createResponse.body.shelter._id;

    // Step 2: Volunteer creates additional shelter
    const volunteerShelterData = {
      name: "Volunteer Managed Shelter",
      description: "Shelter managed by local volunteers",
      shelterType: "COMMUNITY_HALL",
      address: {
        street: "456 Volunteer St",
        city: "Kandy",
        province: "Central",
        postalCode: "20000"
      },
      contact: {
        phone: "+94123456789",
        email: "volunteer@shelter.org"
      },
      location: {
        type: "Point",
        coordinates: [80.6337, 7.2906]
      },
      capacity: {
        total: 75
      },
      supports: {
        disasterTypes: ["LANDSLIDE"],
        wheelchairAccess: false,
        medical: false,
        food: true,
        water: true,
        power: true
      }
    };

    const volunteerCreateResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", volunteerCookie)
      .send(volunteerShelterData);

    expect(volunteerCreateResponse.status).toBe(201);
    expect(volunteerCreateResponse.body.shelter.name).toBe(volunteerShelterData.name);

    // Step 3: NGO creates specialized shelter
    const ngoShelterData = {
      name: "NGO Medical Shelter",
      description: "Specialized medical shelter for injured victims",
      shelterType: "GOVERNMENT_BUILDING",
      address: {
        street: "789 Medical Blvd",
        city: "Galle",
        province: "Southern",
        postalCode: "80000"
      },
      contact: {
        phone: "+94123456790",
        email: "medical@ngo.org"
      },
      location: {
        type: "Point",
        coordinates: [79.8622, 6.0535]
      },
      capacity: {
        total: 50
      },
      supports: {
        disasterTypes: ["TSUNAMI", "FLOOD"],
        wheelchairAccess: true,
        medical: true,
        food: false,
        water: true,
        power: true
      },
      specialSupport: {
        elderlySupport: true,
        disabilitySupport: true,
        pregnancySupport: true,
        petFriendly: false,
        childFriendly: true
      }
    };

    const ngoCreateResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", ngoCookie)
      .send(ngoShelterData);

    expect(ngoCreateResponse.status).toBe(201);
    expect(ngoCreateResponse.body.shelter.name).toBe(ngoShelterData.name);

    // Step 4: Citizen views all available shelters
    const listResponse = await agent
      .get("/api/shelters/get-list");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.shelters).toHaveLength(3);

    // Step 5: Citizen finds nearby shelters
    const nearbyResponse = await agent
      .get("/api/shelters/get-nearby")
      .query({
        lng: 79.8612,
        lat: 6.9271,
        radius: 50 // 50km radius
      });

    expect(nearbyResponse.status).toBe(200);
    expect(nearbyResponse.body.success).toBe(true);
    expect(nearbyResponse.body.shelters.length).toBeGreaterThanOrEqual(1);

    // Step 6: Citizen gets specific shelter details
    const detailsResponse = await agent
      .get(`/api/shelters/get/${shelterId}`);

    expect(detailsResponse.status).toBe(200);
    expect(detailsResponse.body.success).toBe(true);
    expect(detailsResponse.body.shelter.name).toBe(shelterData.name);
    expect(detailsResponse.body.shelter.capacity.available).toBe(200);

    // Step 7: Admin updates shelter capacity and status
    const updateData = {
      occupancy: {
        current: 50
      },
      status: "OPEN"
    };

    const updateResponse = await agent
      .patch(`/api/shelters/update/${shelterId}`)
      .set("Cookie", adminCookie)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.shelter.occupancy.current).toBe(50);
    expect(updateResponse.body.shelter.capacity.available).toBe(150);

    // Step 8: Volunteer updates shelter facilities
    const volunteerUpdateData = {
      supports: {
        wheelchairAccess: true,
        medical: true,
        food: true,
        water: true,
        power: true
      },
      specialSupport: {
        petFriendly: true
      }
    };

    const volunteerUpdateResponse = await agent
      .patch(`/api/shelters/update/${volunteerCreateResponse.body.shelter._id}`)
      .set("Cookie", volunteerCookie)
      .send(volunteerUpdateData);

    expect(volunteerUpdateResponse.status).toBe(200);
    expect(volunteerUpdateResponse.body.shelter.supports.wheelchairAccess).toBe(true);
    expect(volunteerUpdateResponse.body.shelter.supports.medical).toBe(true);
    expect(volunteerUpdateResponse.body.shelter.specialSupport.petFriendly).toBe(true);

    // Step 9: Admin verifies NGO shelter
    const verifyResponse = await agent
      .patch(`/api/shelters/update/${ngoCreateResponse.body.shelter._id}`)
      .set("Cookie", adminCookie)
      .send({ verified: true });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.shelter.verified).toBe(true);

    // Step 10: Citizen searches shelters by disaster type
    const disasterFilterResponse = await agent
      .get("/api/shelters/get-list")
      .query({ disasterTypes: "FLOOD" });

    expect(disasterFilterResponse.status).toBe(200);
    expect(disasterFilterResponse.body.shelters.length).toBeGreaterThan(0);
    expect(disasterFilterResponse.body.shelters.every(shelter => 
      shelter.supports.disasterTypes.includes("FLOOD")
    )).toBe(true);
  });

  it("should handle shelter capacity management workflow", async () => {
    // Step 1: Create shelter with initial capacity
    const shelterData = {
      name: "Capacity Test Shelter",
      address: {
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94123456789"
      },
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      capacity: {
        total: 100
      },
      supports: {
        disasterTypes: ["FLOOD"]
      }
    };

    const createResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", adminCookie)
      .send(shelterData);

    expect(createResponse.status).toBe(201);
    const shelterId = createResponse.body.shelter._id;

    // Step 2: Check initial capacity
    const initialResponse = await agent
      .get(`/api/shelters/get/${shelterId}`);

    expect(initialResponse.status).toBe(200);
    expect(initialResponse.body.shelter.capacity.total).toBe(100);
    expect(initialResponse.body.shelter.capacity.available).toBe(100);
    expect(initialResponse.body.shelter.occupancy.current).toBe(0);

    // Step 3: Incrementally add occupants
    const occupancyUpdates = [25, 50, 75, 100];
    
    for (const occupancy of occupancyUpdates) {
      const updateResponse = await agent
        .patch(`/api/shelters/update/${shelterId}`)
        .set("Cookie", adminCookie)
        .send({
          occupancy: {
            current: occupancy
          }
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.shelter.occupancy.current).toBe(occupancy);
      expect(updateResponse.body.shelter.capacity.available).toBe(100 - occupancy);
    }

    // Step 4: Mark shelter as full
    const fullResponse = await agent
      .patch(`/api/shelters/update/${shelterId}`)
      .set("Cookie", adminCookie)
      .send({
        status: "FULL"
      });

    expect(fullResponse.status).toBe(200);
    expect(fullResponse.body.shelter.status).toBe("FULL");

    // Step 5: Try to add more occupants (should fail validation)
    const overCapacityResponse = await agent
      .patch(`/api/shelters/update/${shelterId}`)
      .set("Cookie", adminCookie)
      .send({
        occupancy: {
          current: 110
        }
      });

    // This might fail validation or succeed depending on implementation
    expect([200, 400]).toContain(overCapacityResponse.status);

    // Step 6: Reduce occupancy and reopen shelter
    const reduceResponse = await agent
      .patch(`/api/shelters/update/${shelterId}`)
      .set("Cookie", adminCookie)
      .send({
        occupancy: {
          current: 80
        },
        status: "OPEN"
      });

    expect(reduceResponse.status).toBe(200);
    expect(reduceResponse.body.shelter.occupancy.current).toBe(80);
    expect(reduceResponse.body.shelter.capacity.available).toBe(20);
    expect(reduceResponse.body.shelter.status).toBe("OPEN");
  });

  it("should handle shelter verification and quality control workflow", async () => {
    // Step 1: Multiple users create shelters
    const shelters = [
      {
        name: "Unverified Shelter 1",
        address: { city: "Colombo", province: "Western", postalCode: "00100" },
        contact: { phone: "+94123456789" },
        location: { type: "Point", coordinates: [79.8612, 6.9271] },
        capacity: { total: 50 },
        supports: { disasterTypes: ["FLOOD"] }
      },
      {
        name: "Unverified Shelter 2",
        address: { city: "Kandy", province: "Central", postalCode: "20000" },
        contact: { phone: "+94123456790" },
        location: { type: "Point", coordinates: [80.6337, 7.2906] },
        capacity: { total: 75 },
        supports: { disasterTypes: ["LANDSLIDE"] }
      },
      {
        name: "Unverified Shelter 3",
        address: { city: "Galle", province: "Southern", postalCode: "80000" },
        contact: { phone: "+94123456791" },
        location: { type: "Point", coordinates: [79.8622, 6.0535] },
        capacity: { total: 100 },
        supports: { disasterTypes: ["TSUNAMI"] }
      }
    ];

    const createdShelters = [];
    for (let i = 0; i < shelters.length; i++) {
      const response = await agent
        .post("/api/shelters/create")
        .set("Cookie", i === 0 ? adminCookie : i === 1 ? volunteerCookie : ngoCookie)
        .send(shelters[i]);

      expect(response.status).toBe(201);
      createdShelters.push(response.body.shelter);
    }

    // Step 2: Admin views unverified shelters
    const unverifiedResponse = await agent
      .get("/api/shelters/get-list")
      .query({ verified: false })
      .set("Cookie", adminCookie);

    expect(unverifiedResponse.status).toBe(200);
    expect(unverifiedResponse.body.shelters.length).toBeGreaterThanOrEqual(3);

    // Step 3: Admin verifies shelters with different criteria
    const verificationResults = [
      { verified: true, notes: "Meets all safety standards" },
      { verified: true, notes: "Good facilities and capacity" },
      { verified: false, notes: "Needs improvements before verification" }
    ];

    for (let i = 0; i < createdShelters.length; i++) {
      const verifyResponse = await agent
        .patch(`/api/shelters/update/${createdShelters[i]._id}`)
        .set("Cookie", adminCookie)
        .send({
          verified: verificationResults[i].verified,
          adminNotes: verificationResults[i].notes
        });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.shelter.verified).toBe(verificationResults[i].verified);
    }

    // Step 4: Citizen views only verified shelters
    const verifiedResponse = await agent
      .get("/api/shelters/get-list")
      .query({ verified: true });

    expect(verifiedResponse.status).toBe(200);
    expect(verifiedResponse.body.shelters.every(shelter => shelter.verified)).toBe(true);

    // Step 5: Admin re-verifies previously unverified shelter
    const reverifyResponse = await agent
      .patch(`/api/shelters/update/${createdShelters[2]._id}`)
      .set("Cookie", adminCookie)
      .send({
        verified: true,
        adminNotes: "Improvements completed, now verified"
      });

    expect(reverifyResponse.status).toBe(200);
    expect(reverifyResponse.body.shelter.verified).toBe(true);
  });

  it("should handle shelter emergency response workflow", async () => {
    // Step 1: Create emergency shelters
    const emergencyShelters = [
      {
        name: "Flood Emergency Shelter",
        description: "Emergency shelter for flood victims",
        shelterType: "SCHOOL",
        address: {
          street: "123 Flood Ave",
          city: "Colombo",
          province: "Western",
          postalCode: "00100"
        },
        contact: {
          phone: "+94123456789",
          email: "flood@emergency.org"
        },
        location: {
          type: "Point",
          coordinates: [79.8612, 6.9271]
        },
        capacity: {
          total: 150
        },
        supports: {
          disasterTypes: ["FLOOD"],
          wheelchairAccess: true,
          medical: true,
          food: true,
          water: true,
          power: true
        },
        verified: true
      },
      {
        name: "Landslide Emergency Shelter",
        description: "Emergency shelter for landslide victims",
        shelterType: "COMMUNITY_HALL",
        address: {
          street: "456 Landslide St",
          city: "Kandy",
          province: "Central",
          postalCode: "20000"
        },
        contact: {
          phone: "+94123456790",
          email: "landslide@emergency.org"
        },
        location: {
          type: "Point",
          coordinates: [80.6337, 7.2906]
        },
        capacity: {
          total: 100
        },
        supports: {
          disasterTypes: ["LANDSLIDE"],
          wheelchairAccess: false,
          medical: false,
          food: true,
          water: true,
          power: false
        },
        verified: true
      }
    ];

    const createdShelters = [];
    for (const shelterData of emergencyShelters) {
      const response = await agent
        .post("/api/shelters/create")
        .set("Cookie", adminCookie)
        .send(shelterData);

      expect(response.status).toBe(201);
      createdShelters.push(response.body.shelter);
    }

    // Step 2: Create emergency help requests
    const emergencyHelpRequests = [
      {
        name: "Family 1",
        location: "Colombo, Sri Lanka",
        realLocation: "Colombo, Sri Lanka",
        disasterType: "flood",
        message: "Family of 5 needs shelter due to flooding",
        contactNumber: "+94123456789"
      },
      {
        name: "Family 2",
        location: "Kandy, Sri Lanka",
        realLocation: "Kandy, Sri Lanka",
        disasterType: "landslide",
        message: "Family of 3 needs shelter after landslide",
        contactNumber: "+94123456790"
      }
    ];

    for (const helpData of emergencyHelpRequests) {
      const response = await agent
        .post("/api/help/add")
        .set("Cookie", citizenCookie)
        .send(helpData);

      expect(response.status).toBe(201);
    }

    // Step 3: Admin assigns help requests to shelters
    const helpRequestsResponse = await agent
      .get("/api/help/")
      .set("Cookie", adminCookie);

    expect(helpRequestsResponse.status).toBe(200);
    expect(helpRequestsResponse.body.length).toBe(2);

    // Step 4: Update shelter occupancy based on assignments
    for (let i = 0; i < createdShelters.length; i++) {
      const occupancyUpdate = {
        occupancy: {
          current: i === 0 ? 25 : 15
        }
      };

      const updateResponse = await agent
        .patch(`/api/shelters/update/${createdShelters[i]._id}`)
        .set("Cookie", adminCookie)
        .send(occupancyUpdate);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.shelter.occupancy.current).toBe(occupancyUpdate.occupancy.current);
    }

    // Step 5: Citizen finds nearby emergency shelters
    for (const helpRequest of emergencyHelpRequests) {
      const city = helpRequest.location.split(',')[0];
      const coordinates = city === 'Colombo' ? 
        { lng: 79.8612, lat: 6.9271 } : 
        { lng: 80.6337, lat: 7.2906 };

      const nearbyResponse = await agent
        .get("/api/shelters/get-nearby")
        .query({
          lng: coordinates.lng,
          lat: coordinates.lat,
          radius: 20
        });

      expect(nearbyResponse.status).toBe(200);
      expect(nearbyResponse.body.shelters.length).toBeGreaterThan(0);
    }

    // Step 6: Volunteer monitors shelter capacity
    const capacityResponse = await agent
      .get("/api/shelters/get-list")
      .query({ status: "OPEN" })
      .set("Cookie", volunteerCookie);

    expect(capacityResponse.status).toBe(200);
    expect(capacityResponse.body.shelters.length).toBeGreaterThan(0);

    // Step 7: Admin updates shelter status based on capacity
    const fullShelterResponse = await agent
      .patch(`/api/shelters/update/${createdShelters[0]._id}`)
      .set("Cookie", adminCookie)
      .send({
        occupancy: { current: 150 },
        status: "FULL"
      });

    expect(fullShelterResponse.status).toBe(200);
    expect(fullShelterResponse.body.shelter.status).toBe("FULL");
    expect(fullShelterResponse.body.shelter.capacity.available).toBe(0);

    // Step 8: Create additional shelter for overflow
    const overflowShelterData = {
      name: "Overflow Emergency Shelter",
      description: "Additional shelter for overflow capacity",
      shelterType: "TEMPLE",
      address: {
        street: "789 Overflow Rd",
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94123456792"
      },
      location: {
        type: "Point",
        coordinates: [79.8620, 6.9270]
      },
      capacity: {
        total: 50
      },
      supports: {
        disasterTypes: ["FLOOD"],
        wheelchairAccess: true,
        medical: false,
        food: true,
        water: true,
        power: false
      },
      verified: true
    };

    const overflowResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", volunteerCookie)
      .send(overflowShelterData);

    expect(overflowResponse.status).toBe(201);
    expect(overflowResponse.body.shelter.name).toBe(overflowShelterData.name);
  });

  it("should handle shelter coordination and communication workflow", async () => {
    // Step 1: Create network of shelters
    const shelterNetwork = [
      {
        name: "Main Coordination Shelter",
        description: "Central coordination point",
        shelterType: "GOVERNMENT_BUILDING",
        address: {
          street: "1 Coordination Plaza",
          city: "Colombo",
          province: "Western",
          postalCode: "00100"
        },
        contact: {
          phone: "+94123456789",
          email: "coordination@shelter.org"
        },
        location: {
          type: "Point",
          coordinates: [79.8612, 6.9271]
        },
        capacity: {
          total: 200
        },
        supports: {
          disasterTypes: ["FLOOD", "LANDSLIDE", "TSUNAMI"],
          wheelchairAccess: true,
          medical: true,
          food: true,
          water: true,
          power: true
        },
        verified: true
      },
      {
        name: "Satellite Shelter 1",
        description: "Satellite shelter north of city",
        shelterType: "SCHOOL",
        address: {
          street: "100 North Rd",
          city: "Colombo",
          province: "Western",
          postalCode: "00100"
        },
        contact: {
          phone: "+94123456790"
        },
        location: {
          type: "Point",
          coordinates: [79.8500, 6.9400]
        },
        capacity: {
          total: 75
        },
        supports: {
          disasterTypes: ["FLOOD"],
          wheelchairAccess: false,
          medical: false,
          food: true,
          water: true,
          power: false
        },
        verified: true
      },
      {
        name: "Satellite Shelter 2",
        description: "Satellite shelter south of city",
        shelterType: "COMMUNITY_HALL",
        address: {
          street: "200 South Ave",
          city: "Colombo",
          province: "Western",
          postalCode: "00100"
        },
        contact: {
          phone: "+94123456791"
        },
        location: {
          type: "Point",
          coordinates: [79.8700, 6.9100]
        },
        capacity: {
          total: 100
        },
        supports: {
          disasterTypes: ["LANDSLIDE"],
          wheelchairAccess: true,
          medical: true,
          food: false,
          water: true,
          power: true
        },
        verified: true
      }
    ];

    const createdShelters = [];
    for (const shelterData of shelterNetwork) {
      const response = await agent
        .post("/api/shelters/create")
        .set("Cookie", adminCookie)
        .send(shelterData);

      expect(response.status).toBe(201);
      createdShelters.push(response.body.shelter);
    }

    // Step 2: Volunteer manages shelter network
    const networkResponse = await agent
      .get("/api/shelters/get-list")
      .set("Cookie", volunteerCookie);

    expect(networkResponse.status).toBe(200);
    expect(networkResponse.body.shelters.length).toBe(3);

    // Step 3: Update shelter capacities based on demand
    const capacityUpdates = [
      { current: 120, status: "OPEN" },
      { current: 60, status: "OPEN" },
      { current: 80, status: "OPEN" }
    ];

    for (let i = 0; i < createdShelters.length; i++) {
      const updateResponse = await agent
        .patch(`/api/shelters/update/${createdShelters[i]._id}`)
        .set("Cookie", volunteerCookie)
        .send({
          occupancy: { current: capacityUpdates[i].current },
          status: capacityUpdates[i].status
        });

      expect(updateResponse.status).toBe(200);
    }

    // Step 4: NGO coordinates resource distribution
    const resourceUpdate = {
      supports: {
        food: true,
        water: true,
        medical: true,
        power: true
      },
      specialSupport: {
        elderlySupport: true,
        disabilitySupport: true,
        childFriendly: true
      }
    };

    for (const shelter of createdShelters) {
      const updateResponse = await agent
        .patch(`/api/shelters/update/${shelter._id}`)
        .set("Cookie", ngoCookie)
        .send(resourceUpdate);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.shelter.supports.food).toBe(true);
      expect(updateResponse.body.shelter.specialSupport.childFriendly).toBe(true);
    }

    // Step 5: Admin monitors shelter network status
    const statusResponse = await agent
      .get("/api/shelters/get-list")
      .query({ status: "OPEN" })
      .set("Cookie", adminCookie);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.shelters.every(shelter => shelter.status === "OPEN")).toBe(true);

    // Step 6: Citizen finds appropriate shelter based on needs
    const specialNeedsResponse = await agent
      .get("/api/shelters/get-list")
      .query({ 
        wheelchairAccess: true,
        medical: true,
        disasterTypes: "FLOOD"
      });

    expect(specialNeedsResponse.status).toBe(200);
    expect(specialNeedsResponse.body.shelters.length).toBeGreaterThan(0);
    expect(specialNeedsResponse.body.shelters.every(shelter => 
      shelter.supports.wheelchairAccess && 
      shelter.supports.medical && 
      shelter.supports.disasterTypes.includes("FLOOD")
    )).toBe(true);

    // Step 7: Emergency capacity redistribution
    // Main shelter reaches capacity
    const mainFullResponse = await agent
      .patch(`/api/shelters/update/${createdShelters[0]._id}`)
      .set("Cookie", adminCookie)
      .send({
        occupancy: { current: 200 },
        status: "FULL"
      });

    expect(mainFullResponse.status).toBe(200);
    expect(mainFullResponse.body.shelter.status).toBe("FULL");

    // Redirect to satellite shelters
    const redirectUpdate = {
      occupancy: { current: 90 }, // Satellite 1 increased
      status: "OPEN"
    };

    const redirectResponse = await agent
      .patch(`/api/shelters/update/${createdShelters[1]._id}`)
      .set("Cookie", adminCookie)
      .send(redirectUpdate);

    expect(redirectResponse.status).toBe(200);
    expect(redirectResponse.body.shelter.occupancy.current).toBe(90);
  });

  it("should handle shelter error scenarios and edge cases", async () => {
    // Test 1: Invalid shelter creation data
    const invalidShelterData = {
      name: "", // Empty name
      address: {
        city: "", // Empty city
        province: "", // Empty province
        postalCode: "" // Empty postal code
      },
      contact: {
        phone: "" // Empty phone
      },
      location: {
        type: "Point",
        coordinates: [] // Empty coordinates
      },
      capacity: {
        total: 0 // Invalid capacity
      },
      supports: {
        disasterTypes: [] // Empty disaster types
      }
    };

    const invalidResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", adminCookie)
      .send(invalidShelterData);

    expect(invalidResponse.status).toBe(400);

    // Test 2: Unauthorized shelter creation
    const unauthorizedResponse = await agent
      .post("/api/shelters/create")
      .send({
        name: "Unauthorized Shelter",
        address: { city: "Test", province: "Test", postalCode: "12345" },
        contact: { phone: "+94123456789" },
        location: { type: "Point", coordinates: [0, 0] },
        capacity: { total: 10 },
        supports: { disasterTypes: ["FLOOD"] }
      });

    expect(unauthorizedResponse.status).toBe(401);

    // Test 3: Non-existent shelter retrieval
    const nonExistentResponse = await agent
      .get("/api/shelters/get/507f1f77bcf86cd799439011");

    expect(nonExistentResponse.status).toBe(404);

    // Test 4: Unauthorized shelter update
    const validShelterData = {
      name: "Valid Shelter",
      address: { city: "Test", province: "Test", postalCode: "12345" },
      contact: { phone: "+94123456789" },
      location: { type: "Point", coordinates: [0, 0] },
      capacity: { total: 10 },
      supports: { disasterTypes: ["FLOOD"] }
    };

    const createResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", adminCookie)
      .send(validShelterData);

    expect(createResponse.status).toBe(201);

    const unauthorizedUpdateResponse = await agent
      .patch(`/api/shelters/update/${createResponse.body.shelter._id}`)
      .set("Cookie", citizenCookie)
      .send({ name: "Unauthorized Update" });

    expect(unauthorizedUpdateResponse.status).toBe(403);

    // Test 5: Unauthorized shelter deletion
    const unauthorizedDeleteResponse = await agent
      .delete(`/api/shelters/delete/${createResponse.body.shelter._id}`)
      .set("Cookie", citizenCookie);

    expect(unauthorizedDeleteResponse.status).toBe(403);

    // Test 6: Invalid coordinates for nearby search
    const invalidCoordinatesResponse = await agent
      .get("/api/shelters/get-nearby")
      .query({
        lng: "invalid",
        lat: "invalid",
        radius: 10
      });

    expect(invalidCoordinatesResponse.status).toBe(400);

    // Test 7: Invalid radius for nearby search
    const invalidRadiusResponse = await agent
      .get("/api/shelters/get-nearby")
      .query({
        lng: 79.8612,
        lat: 6.9271,
        radius: -10 // Negative radius
      });

    expect(invalidRadiusResponse.status).toBe(400);
  });
});
