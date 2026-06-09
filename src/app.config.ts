export default defineAppConfig({
  pages: [
    'pages/patients/index',
    'pages/records/index',
    'pages/assessment/index',
    'pages/followup/index',
    'pages/profile/index',
    'pages/patient-detail/index',
    'pages/record-edit/index',
    'pages/exam-edit/index',
    'pages/risk-detail/index',
    'pages/followup-detail/index',
    'pages/templates/index',
    'pages/phrases/index',
    'pages/export/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A73E8',
    navigationBarTitleText: '心内科助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1A73E8',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/patients/index',
        text: '患者'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/assessment/index',
        text: '评估'
      },
      {
        pagePath: 'pages/followup/index',
        text: '随访'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
