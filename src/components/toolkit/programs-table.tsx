import type { ProgramSection } from '@/lib/types';
import { Check, X } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface ProgramsTableProps {
  section: ProgramSection;
}

export default function ProgramsTable({ section }: ProgramsTableProps) {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-headline text-2xl font-semibold">{section.title}</h3>
        <p className="mt-1 text-muted-foreground">{section.description}</p>
      </div>
      
      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 font-headline">Feature</TableHead>
                <TableHead className="text-center font-headline">Elevate</TableHead>
                <TableHead className="text-center font-headline">Intensive</TableHead>
                <TableHead className="text-center font-headline">Boardroom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.features.map((item) => (
                <TableRow key={item.feature}>
                  <TableCell className="font-medium">{item.feature}</TableCell>
                  <TableCell className="text-center">
                    {typeof item.elevate === 'boolean' ? (
                      item.elevate ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.elevate
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.intensive === 'boolean' ? (
                      item.intensive ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.intensive
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.boardroom === 'boolean' ? (
                      item.boardroom ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.boardroom
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {['Elevate', 'Intensive', 'Boardroom'].map((program) => (
          <Card key={program}>
            <CardHeader>
              <CardTitle className="font-headline">{program}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {section.features.map((item) => {
                  const programKey = program.toLowerCase() as 'elevate' | 'intensive' | 'boardroom';
                  const value = item[programKey];
                  return (
                    <li key={item.feature} className="flex justify-between">
                      <span className="text-muted-foreground">{item.feature}</span>
                       <span className="text-right font-medium">
                        {typeof value === 'boolean' ? (
                            value ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-destructive" />
                        ) : (
                          value
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
