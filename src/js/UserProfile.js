class UserProfile {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.profile = this.loadProfile();
  }

  loadProfile() {
    const saved = this.storageManager.load('profile');
    return saved || {
      name: 'Пользователь',
      age: null,
      height: null,
      weight: null,
      createdAt: new Date().toISOString()
    };
  }

  updateProfile(data) {
    this.profile = { ...this.profile, ...data };
    this.storageManager.save('profile', this.profile);
    return this.profile;
  }

  getProfile() {
    return this.profile;
  }

  calculateBMI() {
    if (!this.profile.height || !this.profile.weight) return null;
    const heightInMeters = this.profile.height / 100;
    return (this.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  getHealthStatus() {
    const bmi = this.calculateBMI();
    if (!bmi) return 'неизвестен';
    if (bmi < 18.5) return 'Недостаточный вес';
    if (bmi < 25) return 'Нормальный вес';
    if (bmi < 30) return 'Избыточный вес';
    return 'Ожирение';
  }
}

export default UserProfile;
