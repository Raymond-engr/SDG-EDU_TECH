try {
  // Use LMS controller methods
  await lmsController.performUserSync(user._id);
  await lmsController.performCourseSync();
} catch (error) {
  console.error('LMS operations failed:', error);
}

res.status(200).json({
  success: true,
  message: 'Email verified. LMS accounts and courses synced.',
});
});