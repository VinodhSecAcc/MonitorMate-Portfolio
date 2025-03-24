<template>
    <div class="profile-container">
      <navigation_bar />
      
      <div class="profile-content">
        <h2 class="profile-title">Profile</h2>
  
        <div class="profile-image-container">
  <img
    :src="ProfileViewModel.profileImageUrl"
    alt="Profile Image"
    v-if="ProfileViewModel.profileImageUrl"
    class="profile-image"
  />
  
  <label v-if="ProfileViewModel.isEditing" class="upload-button">
    Upload Image
    <input type="file" @change="ProfileViewModel.onFileChange" class="hidden-file-input" />
  </label>
</div>

  
        <div class="profile-fields">
          <div class="input-group">
            <label>Username</label>
            <input v-model="ProfileViewModel.username" :disabled="!ProfileViewModel.isEditing" type="text" class="styled-input" />
            <span class="error" v-if="ProfileViewModel.errors.username">{{ ProfileViewModel.errors.username }}</span>
          </div>
  
          <div class="input-group">
            <label>University ID</label>
            <input v-model="ProfileViewModel.universityId" :disabled="!ProfileViewModel.isEditing" type="text" class="styled-input" />
            <span class="error" v-if="ProfileViewModel.errors.universityId">{{ ProfileViewModel.errors.universityId }}</span>
          </div>
  
          <div class="input-group">
            <label>Mobile Number</label>
            <input v-model="ProfileViewModel.phoneNumber" :disabled="!ProfileViewModel.isEditing" type="text" class="styled-input" />
            <span class="error" v-if="ProfileViewModel.errors.phoneNumber">{{ ProfileViewModel.errors.phoneNumber }}</span>
          </div>
  
          <div class="input-group">
            <label>Faculty</label>
            <select v-model="ProfileViewModel.selectedFaculty" @change="ProfileViewModel.updateFaculty($event.target.value)" :disabled="!ProfileViewModel.isEditing" class="styled-select">
              <option v-for="(courses, faculty) in ProfileViewModel.facultyCourses" :key="faculty" :value="faculty">
                {{ faculty }}
              </option>
            </select>
            <span class="error" v-if="ProfileViewModel.errors.selectedFaculty">{{ ProfileViewModel.errors.selectedFaculty }}</span>
          </div>
  
          <div class="input-group">
            <label>Course</label>
            <select v-model="ProfileViewModel.selectedCourse" :disabled="!ProfileViewModel.isEditing" class="styled-select">
              <option v-for="course in ProfileViewModel.facultyCourses[ProfileViewModel.selectedFaculty]" :key="course" :value="course">
                {{ course }}
              </option>
            </select>
            <span class="error" v-if="ProfileViewModel.errors.selectedCourse">{{ ProfileViewModel.errors.selectedCourse }}</span>
          </div>
        </div>
  
        <div class="profile-buttons">
          <button @click="ProfileViewModel.toggleEditing" class="button">
            {{ ProfileViewModel.isEditing ? "Cancel" : "Edit" }}
          </button>
          <button v-if="ProfileViewModel.isEditing" @click="ProfileViewModel.saveProfile" class="button save-button">Save</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ProfileViewModel from '@/viewmodel/profile_viewmodel';
  import navigation_bar from '@/components/navigation_bar.vue';
  import { useHead } from '@vueuse/head';
  
  export default {
    components: {
      navigation_bar
    },
    setup() {
      useHead({
      title: 'Profile',
      meta: [
        { name: 'description', content: 'This is a sample description' }
      ]
    });
      ProfileViewModel.initAuth(() => {});
      return { ProfileViewModel };
    },
  };
  </script>
  
  <style>
  /* Full black background */
  body {
    
    background: url("@/assets/background.jpg") ;
    margin: 0;
    padding: 0;
  }
  
  .profile-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Space for navigation bar */
  .profile-content {
    width: 50%;
    text-align: center;
    background-color: #111;
    padding: 30px;
    border: 3px solid rgb(84, 84, 84); /* Added white border */
    border-radius: 10px;
    color: white;
    margin-top: 300px; /* Move profile section down */
  }
  
  .profile-title {
    color: #fff;
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .profile-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgb(84, 84, 84);
  }
  
  .file-input {
    margin-top: 10px;
    color: white;
  }
  
  /* Adjusted spacing for inputs and dropdowns */
  .profile-fields {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    width: 100%;
  }
  
  .input-group {
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  label {
    font-weight: bold;
    color: white;
    margin-bottom: 5px;
  }
  
  .styled-input,
  .styled-select {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid white;
    background-color: #222;
    color: white;
    outline: none;
    font-size: 16px;
  }
  
  .styled-input:disabled,
  .styled-select:disabled {
    background-color: #333;
    cursor: not-allowed;
  }
  
  .error {
    color: red;
    font-size: 12px;
    margin-top: 5px;
  }
  
  .profile-buttons {
    margin-top: 20px;
  }
  
  .button {
    margin: 5px;
    padding: 12px 18px;
    border: none;
    border-radius: 5px;
    background-color: lightgreen;
    color: rgb(15, 91, 42);
    cursor: pointer;
    transition: 0.3s;
    font-size: 16px;
  }
  
  .button:hover {
    background-color: #ffe600;
  }
  
  .save-button {
    background-color: lightgreen;
  }
  
  .save-button:hover {
    background-color: #ffe600;
  }

  .upload-button {
  display: inline-block;
  background-color: lightgreen;
  color: rgb(15, 91, 42);
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  transition: background 0.3s;
}

.upload-button:hover {
  background-color: #ffe600;
}

.hidden-file-input {
  display: none;
}

  </style>
  