Write-Host "Waking up Raspberry Pi..."
Test-Connection -ComputerName 192.168.1.107 -Count 1 -Quiet
Start-Sleep -Seconds 1

Write-Host "Building React App..." -ForegroundColor Cyan
npm run build

Write-Host "Transferring to Raspberry Pi..." -ForegroundColor Cyan
scp -r dist/* superadmin@192.168.1.111:/home/superadmin/New_TA/dist/

Write-Host "Moving files on Pi..." -ForegroundColor Cyan
ssh superadmin@192.168.1.111 "sudo cp -r /home/superadmin/New_TA/dist/* /var/www/pnm-frontend/ && sudo chown -R www-data:www-data /var/www/pnm-frontend"

Write-Host "Deployed successfully!" -ForegroundColor Green